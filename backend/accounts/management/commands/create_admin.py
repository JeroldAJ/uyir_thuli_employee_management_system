import os

from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an additional Admin from one-time environment variables.'

    def handle(self, *args, **options):
        email = os.getenv('EMS_CREATE_ADMIN_EMAIL', '').strip()
        password = os.getenv('EMS_CREATE_ADMIN_PASSWORD', '')

        if not email and not password:
            self.stdout.write('Additional admin creation skipped; no credentials configured.')
            return
        if not email or not password:
            raise CommandError(
                'Set both EMS_CREATE_ADMIN_EMAIL and EMS_CREATE_ADMIN_PASSWORD.'
            )

        try:
            validate_email(email)
        except ValidationError as exc:
            raise CommandError('EMS_CREATE_ADMIN_EMAIL must be a valid email address.') from exc

        with transaction.atomic():
            if User.objects.select_for_update().filter(email__iexact=email).exists():
                self.stdout.write('Additional admin creation skipped; this email already exists.')
                return

            user = User(email=email, role=User.Role.ADMIN, is_staff=True, is_superuser=True)
            try:
                password_validation.validate_password(password, user=user)
            except ValidationError as exc:
                raise CommandError('; '.join(exc.messages)) from exc

            User.objects.create_superuser(email=email, password=password)

        self.stdout.write(self.style.SUCCESS('Additional admin account created.'))
