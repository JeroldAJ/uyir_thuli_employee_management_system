from rest_framework.routers import DefaultRouter

from .views import AttendanceViewSet, LeaveRequestViewSet

router = DefaultRouter()
router.register('attendance', AttendanceViewSet, basename='attendance')
router.register('leaves', LeaveRequestViewSet, basename='leave-request')

urlpatterns = router.urls
