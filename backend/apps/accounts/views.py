import secrets

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db.models import Q
from django.middleware.csrf import get_token
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import PasswordResetOTP
from .serializers import (
    AuthenticatedUserSerializer,
    ForgotPasswordConfirmSerializer,
    ForgotPasswordRequestSerializer,
    LoginSerializer,
)


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf(request):
    return Response({"csrfToken": get_token(request)})


@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data["username"]
    password = serializer.validated_data["password"]
    user = authenticate(request, username=username, password=password)

    if not user:
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_staff:
        return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

    login(request, user)
    return Response({"user": AuthenticatedUserSerializer(user).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@csrf_protect
def logout_view(request):
    logout(request)
    return Response({"detail": "Logged out successfully."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({"user": AuthenticatedUserSerializer(request.user).data})


@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def forgot_password_request(request):
    serializer = ForgotPasswordRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].strip().lower()
    user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()

    if user:
        code = f"{secrets.randbelow(1000000):06d}"
        PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)
        PasswordResetOTP.objects.create(
            user=user,
            email=email,
            code=code,
            expires_at=PasswordResetOTP.expiry_time(),
        )

        html_message = render_to_string(
            "emails/forgot_password_otp.html",
            {
                "otp": code,
                "brand_name": "NextGen Solutions",
                "support_email": settings.ADMIN_NOTIFICATION_EMAIL,
            },
        )

        send_mail(
            subject="NextGen Solutions Admin Password Reset OTP",
            message=f"Your OTP is {code}. It expires in 10 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )

    return Response(
        {
            "detail": "If that email exists, an OTP has been sent.",
            "expiresInMinutes": 10,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@csrf_protect
def forgot_password_confirm(request):
    serializer = ForgotPasswordConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].strip().lower()
    code = serializer.validated_data["code"]
    new_password = serializer.validated_data["new_password"]

    user = User.objects.filter(Q(email__iexact=email) | Q(username__iexact=email)).first()
    if not user:
        return Response({"detail": "Invalid OTP or email."}, status=status.HTTP_400_BAD_REQUEST)

    otp = PasswordResetOTP.objects.filter(user=user, code=code, is_used=False).first()
    if not otp or otp.is_expired:
        return Response({"detail": "OTP is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save(update_fields=["password"])

    otp.is_used = True
    otp.save(update_fields=["is_used"])

    return Response({"detail": "Password reset successful. Please login."})
