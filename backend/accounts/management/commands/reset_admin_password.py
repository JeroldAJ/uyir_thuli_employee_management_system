import os

from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Reset an existing superuser password using one-time environment variables.'

    def handle(self, *args, **options):
        email = os.getenv('EMS_RESET_ADMIN_EMAIL', '').strip()
        password = os.getenv('EMS_RESET_ADMIN_PASSWORD', '')

        if not email and not password:
            self.stdout.write('Admin password reset skipped; no reset credentials configured.')
            return
        if not email or not password:
            raise CommandError(
                'Set both EMS_RESET_ADMIN_EMAIL and EMS_RESET_ADMIN_PASSWORD.'
            )

        with transaction.atomic():
            try:
                user = User.objects.select_for_update().get(
                    email__iexact=email,
                    is_superuser=True,
                )
            except User.DoesNotExist as exc:
                raise CommandError(
                    'No superuser matches EMS_RESET_ADMIN_EMAIL.'
                ) from exc
            except User.MultipleObjectsReturned as exc:
                raise CommandError(
                    'Multiple superusers match EMS_RESET_ADMIN_EMAIL; use the exact email.'
                ) from exc

            try:
                password_validation.validate_password(password, user=user)
            except ValidationError as exc:
                raise CommandError('; '.join(exc.messages)) from exc

            user.set_password(password)
            user.save(update_fields=('password',))

        self.stdout.write(self.style.SUCCESS('Admin password reset completed.'))
