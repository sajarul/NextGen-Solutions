from django.contrib import admin

from .models import PasswordResetOTP


@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = ("email", "code", "expires_at", "is_used", "created_at")
    list_filter = ("is_used", "created_at")
    search_fields = ("email", "user__username")
