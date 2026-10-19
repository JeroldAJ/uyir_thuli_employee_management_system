from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsAdminOrHR
from employees.models import Employee
from .models import Attendance, LeaveRequest
from .serializers import AttendanceSerializer, LeaveRequestSerializer


def employee_for_user(user):
    try:
        return user.employee
    except Employee.DoesNotExist as exc:
        raise PermissionDenied('Your account is not linked to an employee profile.') from exc


class AttendanceViewSet(ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        records = Attendance.objects.select_related('employee')
        if self.request.user.role in ('Admin', 'HR'):
            return records.all()
        return records.filter(employee__user=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role in ('Admin', 'HR'):
            serializer.save()
        else:
            serializer.save(employee=employee_for_user(self.request.user))

    def perform_update(self, serializer):
        if self.request.user.role not in ('Admin', 'HR'):
            raise PermissionDenied('Only Admin or HR users can edit attendance records.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in ('Admin', 'HR'):
            raise PermissionDenied('Only Admin or HR users can delete attendance records.')
        instance.delete()


class LeaveRequestViewSet(ModelViewSet):
    serializer_class = LeaveRequestSerializer

    def get_queryset(self):
        requests = LeaveRequest.objects.select_related('employee')
        if self.request.user.role in ('Admin', 'HR'):
            return requests.all()
        return requests.filter(employee__user=self.request.user)

    def get_permissions(self):
        if self.action in ('update', 'partial_update', 'destroy'):
            permission_classes = (IsAdminOrHR,)
        else:
            permission_classes = (permissions.IsAuthenticated,)
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(employee=employee_for_user(self.request.user))

    def perform_update(self, serializer):
        serializer.save()
