from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    PaymentOrderAdminViewSet,
    create_checkout_order,
    create_manual_payment_order,
    razorpay_webhook,
    submit_manual_payment,
    verify_checkout_payment,
)

admin_router = DefaultRouter()
admin_router.register("orders", PaymentOrderAdminViewSet, basename="payment-admin-orders")

urlpatterns = [
    path("create-order/", create_checkout_order, name="payment-create-order"),
    path("manual/create/", create_manual_payment_order, name="payment-manual-create"),
    path("manual/submit/", submit_manual_payment, name="payment-manual-submit"),
    path("verify/", verify_checkout_payment, name="payment-verify"),
    path("webhook/", razorpay_webhook, name="payment-webhook"),
    path("admin/", include(admin_router.urls)),
]
