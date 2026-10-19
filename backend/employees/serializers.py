from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from accounts.models import User
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = Employee
        fields = (
            'id', 'user', 'first_name', 'last_name', 'email', 'phone',
            'department', 'designation', 'date_of_joining', 'password',
        )
        read_only_fields = ('id', 'user')

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'An initial password is required.'})
        email = attrs.get('email')
        if email:
            users = User.objects.filter(email__iexact=email)
            if self.instance:
                users = users.exclude(pk=self.instance.user_id)
            if users.exists():
                raise serializers.ValidationError({'email': 'A user account already exists with this email address.'})
        if attrs.get('password'):
            try:
                password_validation.validate_password(attrs['password'], user=User(
                    email=attrs.get('email', ''),
                    first_name=attrs.get('first_name', ''),
                    last_name=attrs.get('last_name', ''),
                ))
            except DjangoValidationError as exc:
                raise serializers.ValidationError({'password': exc.messages}) from exc
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data['email']
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=User.Role.EMPLOYEE,
        )
        return Employee.objects.create(user=user, **validated_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')
        for attribute, value in validated_data.items():
            setattr(instance, attribute, value)
        instance.save()
        user_fields = []
        if email is not None and instance.user.email != email:
            instance.user.email = email
            user_fields.append('email')
        if first_name is not None:
            instance.user.first_name = first_name
            user_fields.append('first_name')
        if last_name is not None:
            instance.user.last_name = last_name
            user_fields.append('last_name')
        if password:
            try:
                password_validation.validate_password(password, user=instance.user)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({'password': exc.messages}) from exc
            instance.user.set_password(password)
            user_fields.append('password')
        if user_fields:
            instance.user.save(update_fields=user_fields)
        return instance
