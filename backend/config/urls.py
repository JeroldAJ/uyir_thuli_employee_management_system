from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('employees.urls')),
    path('api/', include('attendance.urls')),
]
