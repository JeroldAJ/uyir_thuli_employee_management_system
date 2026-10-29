from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.management import call_command, CommandError
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

User = get_user_model()


class PasswordResetApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='employee@example.test',
            password='Original-Password-5732!',
        )
        self.client = APIClient()

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_reset_request_sends_frontend_link_without_disclosing_unknown_addresses(self):
        from django.core import mail

        response = self.client.post(
            '/api/auth/password-reset/',
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('/reset-password/', mail.outbox[0].body)

        response = self.client.post(
            '/api/auth/password-reset/',
            {'email': 'missing@example.test'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

    def test_valid_reset_token_changes_password(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        response = self.client.post(
            '/api/auth/password-reset/confirm/',
            {
                'uid': uid,
                'token': token,
                'password': 'New-Password-8732!',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('New-Password-8732!'))


class BootstrapAdminCommandTests(TestCase):
    def test_command_creates_initial_admin_and_does_not_reset_existing_admin(self):
        environment = {
            'EMS_BOOTSTRAP_ADMIN_EMAIL': 'initial-admin@example.test',
            'EMS_BOOTSTRAP_ADMIN_PASSWORD': 'Initial-Admin-Password-4728!',
        }
        with patch.dict('os.environ', environment, clear=False):
            output = StringIO()
            call_command('bootstrap_admin', stdout=output)
            self.assertIn('Initial admin account created.', output.getvalue())

            admin = User.objects.get(email=environment['EMS_BOOTSTRAP_ADMIN_EMAIL'])
            self.assertTrue(admin.is_superuser)
            self.assertEqual(admin.role, User.Role.ADMIN)
            self.assertTrue(admin.check_password(environment['EMS_BOOTSTRAP_ADMIN_PASSWORD']))

            environment['EMS_BOOTSTRAP_ADMIN_PASSWORD'] = 'Different-Password-8472!'
            call_command('bootstrap_admin', stdout=StringIO())
            admin.refresh_from_db()
            self.assertTrue(admin.check_password('Initial-Admin-Password-4728!'))

    def test_command_rejects_partial_or_weak_credentials(self):
        with patch.dict('os.environ', {
            'EMS_BOOTSTRAP_ADMIN_EMAIL': 'initial-admin@example.test',
            'EMS_BOOTSTRAP_ADMIN_PASSWORD': '',
        }, clear=False):
            with self.assertRaises(CommandError):
                call_command('bootstrap_admin')

        with patch.dict('os.environ', {
            'EMS_BOOTSTRAP_ADMIN_EMAIL': 'initial-admin@example.test',
            'EMS_BOOTSTRAP_ADMIN_PASSWORD': 'password',
        }, clear=False):
            with self.assertRaises(CommandError):
                call_command('bootstrap_admin')
