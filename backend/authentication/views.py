from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    EmailOrUsernameTokenSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from users.serializers import UserSerializer

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class LoginView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"detail": "E-posta gerekli."}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Eğer bu e-posta ile kayıtlı bir hesap varsa, "
                        "sıfırlama bağlantısı gönderildi."
                    )
                },
                status=200,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        frontend_base = getattr(
            settings, "FRONTEND_BASE_URL", "http://localhost:5173"
        )
        reset_link = f"{frontend_base}/reset-password/{uid}/{token}"

        message = (
            "Merhaba,\n\n"
            "Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla:\n\n"
            f"{reset_link}\n\n"
            "Eğer bu isteği sen yapmadıysan, bu e-postayı yok sayabilirsin."
        )

        send_mail(
            subject="Şifre Sıfırlama",
            message=message,
            from_email="no-reply@social-library.local",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                "detail": (
                    "Eğer bu e-posta ile kayıtlı bir hesap varsa, "
                    "sıfırlama bağlantısı gönderildi."
                )
            },
            status=200,
        )


class PasswordResetConfirmView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        password2 = request.data.get("password2")

        if not uidb64 or not token:
            return Response(
                {"detail": "Bağlantı geçersiz veya süresi dolmuş."},
                status=400,
            )

        if not password or not password2:
            return Response(
                {"detail": "Şifre alanları zorunludur."},
                status=400,
            )

        if password != password2:
            return Response(
                {"detail": "Şifreler birbiriyle uyuşmuyor."},
                status=400,
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Bağlantı geçersiz veya süresi dolmuş."},
                status=400,
            )

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {"detail": "Bağlantı geçersiz veya süresi dolmuş."},
                status=400,
            )

        user.set_password(password)
        user.save()

        return Response({"detail": "Şifren başarıyla güncellendi."}, status=200)