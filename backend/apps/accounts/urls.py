from django.urls import path

from .views import (
    csrf,
    forgot_password_confirm,
    forgot_password_request,
    login_view,
    logout_view,
    me,
)

urlpatterns = [
    path("csrf/", csrf, name="auth-csrf"),
    path("login/", login_view, name="auth-login"),
    path("logout/", logout_view, name="auth-logout"),
    path("me/", me, name="auth-me"),
    path("forgot-password/request/", forgot_password_request, name="auth-forgot-request"),
    path("forgot-password/confirm/", forgot_password_confirm, name="auth-forgot-confirm"),
]
