from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import EMSAccessTokenSerializer, PasswordResetConfirmSerializer


class EMSAccessTokenView(TokenObtainPairView):
    serializer_class = EMSAccessTokenSerializer


class PasswordResetRequestView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        form = PasswordResetForm(data=request.data)
        if form.is_valid():
            form.save(
                request=request._request,
                use_https=request.is_secure(),
                email_template_name='accounts/password_reset_email.html',
                subject_template_name='accounts/password_reset_subject.txt',
                extra_email_context={'frontend_url': settings.FRONTEND_URL},
            )
        return Response(
            {'detail': 'If an active account exists for that email, reset instructions will be sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)
