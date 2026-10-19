from datetime import date

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from employees.models import Employee
from .models import Attendance

User = get_user_model()


class EMSApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@example.test',
            password='Admin-Password-8491!',
        )
        self.employee_user = User.objects.create_user(
            email='employee@example.test',
            password='Employee-Password-4721!',
            first_name='Riley',
            last_name='Chen',
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            first_name='Riley',
            last_name='Chen',
            email=self.employee_user.email,
            department='Engineering',
            designation='Developer',
            date_of_joining=date(2026, 1, 12),
        )
        self.hr = User.objects.create_user(
            email='hr@example.test',
            password='HR-Password-2391!',
            role=User.Role.HR,
        )

    def authenticate(self, user, password):
        response = self.client.post(
            '/api/token/',
            {'email': user.email, 'password': password},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_admin_can_create_employee_and_employee_cannot_manage_directory(self):
        self.authenticate(self.admin, 'Admin-Password-8491!')
        response = self.client.post('/api/employees/', {
            'email': 'new.employee@example.test',
            'password': 'Initial-Password-3629!',
            'first_name': 'Alex',
            'last_name': 'Rivera',
            'phone': '5550101',
            'department': 'People',
            'designation': 'Coordinator',
            'date_of_joining': '2026-02-01',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        created_user = User.objects.get(email='new.employee@example.test')
        self.assertEqual(created_user.role, User.Role.EMPLOYEE)

        self.authenticate(self.employee_user, 'Employee-Password-4721!')
        self.assertEqual(self.client.get('/api/employees/').status_code, 403)

    def test_attendance_is_scoped_and_unique_per_employee_per_day(self):
        Attendance.objects.create(employee=self.employee, date=date(2026, 10, 17))
        other_user = User.objects.create_user(
            email='other@example.test',
            password='Other-Password-7134!',
        )
        other_employee = Employee.objects.create(
            user=other_user,
            first_name='Jordan',
            last_name='Lee',
            email=other_user.email,
            department='Design',
            designation='Designer',
            date_of_joining=date(2026, 3, 1),
        )
        Attendance.objects.create(employee=other_employee, date=date(2026, 10, 17))

        self.authenticate(self.employee_user, 'Employee-Password-4721!')
        response = self.client.get('/api/attendance/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        response = self.client.post('/api/attendance/', {
            'date': '2026-10-17',
            'status': 'Present',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_admin_can_record_attendance_for_an_employee(self):
        self.authenticate(self.admin, 'Admin-Password-8491!')
        response = self.client.post('/api/attendance/', {
            'employee': self.employee.id,
            'date': '2026-10-17',
            'status': 'Late',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data['employee_name'], 'Riley Chen')

    def test_employee_submits_leave_and_hr_can_approve_it(self):
        self.authenticate(self.employee_user, 'Employee-Password-4721!')
        response = self.client.post('/api/leaves/', {
            'start_date': '2026-11-01',
            'end_date': '2026-11-03',
            'reason': 'Family event',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        leave_id = response.data['id']
        self.assertEqual(response.data['status'], 'Pending')
        self.assertEqual(
            self.client.patch(
                f'/api/leaves/{leave_id}/',
                {'status': 'Approved'},
                format='json',
            ).status_code,
            403,
        )

        self.authenticate(self.hr, 'HR-Password-2391!')
        response = self.client.patch(
            f'/api/leaves/{leave_id}/',
            {'status': 'Approved'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['status'], 'Approved')
