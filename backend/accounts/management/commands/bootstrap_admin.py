import os

from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create the initial admin from one-time environment variables, if no superuser exists.'

    def handle(self, *args, **options):
        email = os.getenv('EMS_BOOTSTRAP_ADMIN_EMAIL', '').strip()
        password = os.getenv('EMS_BOOTSTRAP_ADMIN_PASSWORD', '')

        if not email and not password:
            self.stdout.write('Admin bootstrap skipped; no bootstrap credentials configured.')
            return
        if not email or not password:
            raise CommandError(
                'Set both EMS_BOOTSTRAP_ADMIN_EMAIL and EMS_BOOTSTRAP_ADMIN_PASSWORD.'
            )

        with transaction.atomic():
            if User.objects.filter(is_superuser=True).exists():
                self.stdout.write('Admin bootstrap skipped; an admin already exists.')
                return

            user = User(email=email, role=User.Role.ADMIN, is_staff=True, is_superuser=True)
            try:
                password_validation.validate_password(password, user=user)
            except ValidationError as exc:
                raise CommandError('; '.join(exc.messages)) from exc

            User.objects.create_superuser(email=email, password=password)

        self.stdout.write(self.style.SUCCESS('Initial admin account created.'))
