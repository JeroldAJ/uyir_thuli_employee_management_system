from rest_framework.permissions import BasePermission


class IsAdminOrHR(BasePermission):
    message = 'Only Admin or HR users can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('Admin', 'HR')
        )
