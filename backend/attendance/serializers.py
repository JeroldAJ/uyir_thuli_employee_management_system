from rest_framework import serializers

from employees.models import Employee
from .models import Attendance, LeaveRequest


class AttendanceSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), required=False)
    employee_name = serializers.StringRelatedField(source='employee', read_only=True)

    class Meta:
        model = Attendance
        fields = ('id', 'employee', 'employee_name', 'date', 'status')
        read_only_fields = ('id', 'employee_name')

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        if request and request.user.role in ('Admin', 'HR'):
            if self.instance is None:
                fields['employee'].required = True
        else:
            fields['employee'].read_only = True
        return fields

    def validate(self, attrs):
        date = attrs.get('date', getattr(self.instance, 'date', None))
        request = self.context.get('request')
        employee = attrs.get('employee', self.instance.employee if self.instance else None)
        if employee is None and request and request.user.is_authenticated:
            employee = Employee.objects.filter(user=request.user).first()
        if employee and date:
            records = Attendance.objects.filter(employee=employee, date=date)
            if self.instance:
                records = records.exclude(pk=self.instance.pk)
            if records.exists():
                raise serializers.ValidationError({
                    'date': 'Attendance has already been recorded for this employee on this date.',
                })
        return attrs


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.StringRelatedField(source='employee', read_only=True)
    status = serializers.ChoiceField(choices=LeaveRequest.Status.choices, required=False)

    class Meta:
        model = LeaveRequest
        fields = ('id', 'employee', 'employee_name', 'start_date', 'end_date', 'reason', 'status', 'created_at')
        read_only_fields = ('id', 'employee', 'employee_name', 'status', 'created_at')

    def validate(self, attrs):
        request = self.context.get('request')
        status = attrs.get('status')
        if status is not None and request and request.user.role not in ('Admin', 'HR'):
            if self.instance is not None or status != LeaveRequest.Status.PENDING:
                raise serializers.ValidationError({'status': 'Only Admin or HR users can change leave request status.'})
        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'end_date': 'End date must be on or after the start date.'})
        return attrs
