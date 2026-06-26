from django.contrib import admin

from .models import PaymentOrder


@admin.register(PaymentOrder)
class PaymentOrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "plan_name",
        "customer_name",
        "customer_email",
        "status",
        "amount_paise",
        "provider_order_id",
        "provider_payment_id",
        "paid_at",
        "created_at",
    )
    list_filter = ("status", "plan_code", "created_at", "paid_at")
    search_fields = (
        "customer_name",
        "customer_email",
        "customer_phone",
        "provider_order_id",
        "provider_payment_id",
    )
