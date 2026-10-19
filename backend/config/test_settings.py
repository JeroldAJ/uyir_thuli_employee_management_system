import os

os.environ.setdefault('DJANGO_DEBUG', 'True')

from .settings import *  # noqa: F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    },
}
ALLOWED_HOSTS = [*ALLOWED_HOSTS, 'testserver']  # noqa: F405
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
