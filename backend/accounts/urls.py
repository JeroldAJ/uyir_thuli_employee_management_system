from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import EMSAccessTokenView, PasswordResetConfirmView, PasswordResetRequestView

urlpatterns = [
    path('token/', EMSAccessTokenView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
