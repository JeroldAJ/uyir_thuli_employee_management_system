from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsAdminOrHR
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeViewSet(ModelViewSet):
    queryset = Employee.objects.select_related('user').all()
    serializer_class = EmployeeSerializer
    permission_classes = (IsAdminOrHR,)
