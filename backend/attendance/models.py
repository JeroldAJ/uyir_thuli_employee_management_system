from django.db import models

from employees.models import Employee


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'Present', 'Present'
        LATE = 'Late', 'Late'
        ABSENT = 'Absent', 'Absent'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)

    class Meta:
        ordering = ('-date', 'employee__last_name')
        constraints = [
            models.UniqueConstraint(fields=('employee', 'date'), name='unique_employee_attendance_per_day'),
        ]

    def __str__(self):
        return f'{self.employee} — {self.date}: {self.status}'


class LeaveRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        APPROVED = 'Approved', 'Approved'
        REJECTED = 'Rejected', 'Rejected'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.employee}: {self.start_date}–{self.end_date} ({self.status})'
