import base64
import hashlib
import hmac
import json
import logging
import urllib.error
import urllib.request
from typing import Optional
from urllib.parse import quote_plus

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import PaymentOrder, PaymentPlan, PaymentStatus
from .serializers import (
    ManualPaymentSubmitSerializer,
    PaymentOrderAdminSerializer,
    PaymentOrderCreateSerializer,
    PaymentVerifySerializer,
)

logger = logging.getLogger(__name__)

PLAN_CATALOG = {
    PaymentPlan.BASIC: {"name": "Basic Plan", "amount_paise": 199900},
    PaymentPlan.STANDARD: {"name": "Standard Plan", "amount_paise": 499900},
    PaymentPlan.PREMIUM: {"name": "Premium Plan", "amount_paise": 999900},
}


def _manual_qr_config_error() -> Optional[str]:
    upi_id = (settings.UPI_ID or "").strip()
    payee_name = (settings.UPI_PAYEE_NAME or "").strip()
    if not settings.MANUAL_PAYMENT_ENABLED:
        return "Manual QR payment is currently disabled."
    if not upi_id or "your_upi_id" in upi_id.lower():
        return "UPI ID is not configured. Please set UPI_ID in backend .env."
    if not payee_name:
        return "UPI payee name is not configured. Please set UPI_PAYEE_NAME in backend .env."
    return None


def _build_upi_links(local_order: PaymentOrder) -> dict:
    amount_rupees = f"{local_order.amount_paise / 100:.2f}"
    note = f"{local_order.plan_name} - Order {local_order.id}"
    upi_uri = (
        f"upi://pay?pa={quote_plus(settings.UPI_ID)}"
        f"&pn={quote_plus(settings.UPI_PAYEE_NAME)}"
        f"&am={quote_plus(amount_rupees)}"
        f"&cu={quote_plus(local_order.currency)}"
        f"&tn={quote_plus(note)}"
    )
    qr_image_url = f"https://api.qrserver.com/v1/create-qr-code/?size=320x320&data={quote_plus(upi_uri)}"
    return {
        "upi_uri": upi_uri,
        "qr_image_url": qr_image_url,
        "amount_rupees": amount_rupees,
    }


def _provider_config_error() -> Optional[str]:
    key_id = (settings.RAZORPAY_KEY_ID or "").strip()
    key_secret = (settings.RAZORPAY_KEY_SECRET or "").strip()

    if not key_id or not key_secret:
        return "Payment gateway is not configured. Please add Razorpay keys in backend .env."

    # Catch default placeholder values to avoid confusing gateway failures.
    key_pair = f"{key_id} {key_secret}".lower()
    if "xxxxxxxx" in key_pair or "change-me" in key_pair or "your_real" in key_pair:
        return "Payment gateway keys are placeholders. Please add real Razorpay keys in backend .env."

    if not (key_id.startswith("rzp_test_") or key_id.startswith("rzp_live_")):
        return "Razorpay Key ID format looks invalid. Please check backend .env."

    return None


def _razorpay_order_create(amount_paise: int, currency: str, receipt: str, notes: dict) -> str:
    auth_token = base64.b64encode(
        f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode("utf-8")
    ).decode("utf-8")

    payload = {
        "amount": amount_paise,
        "currency": currency,
        "receipt": receipt,
        "notes": notes,
    }

    request = urllib.request.Request(
        url="https://api.razorpay.com/v1/orders",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Basic {auth_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
            provider_order_id = data.get("id")
            if not provider_order_id:
                raise ValueError("Provider order id missing")
            return provider_order_id
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        logger.error("Razorpay create order failed: %s", body)

        provider_message = ""
        try:
            payload = json.loads(body)
            provider_message = (
                payload.get("error", {}).get("description")
                or payload.get("description")
                or ""
            )
        except json.JSONDecodeError:
            provider_message = ""

        if provider_message:
            raise ValueError(f"Payment gateway error: {provider_message}") from exc

        raise ValueError("Unable to create payment order with gateway.") from exc
    except Exception as exc:
        logger.exception("Unexpected Razorpay order error")
        raise ValueError("Payment gateway error. Please try again.") from exc


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@csrf_protect
def create_checkout_order(request):
    if not settings.PAYMENTS_ENABLED:
        return Response(
            {"detail": "Payments are currently disabled."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    provider_config_error = _provider_config_error()
    if provider_config_error:
        return Response(
            {"detail": provider_config_error},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    serializer = PaymentOrderCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    plan = PLAN_CATALOG[data["plan_code"]]

    local_order = PaymentOrder.objects.create(
        plan_code=data["plan_code"],
        plan_name=plan["name"],
        amount_paise=plan["amount_paise"],
        currency=settings.PAYMENT_CURRENCY,
        customer_name=data["customer_name"],
        customer_email=data["customer_email"],
        customer_phone=data["customer_phone"],
        project_details=data.get("project_details", ""),
    )

    receipt = f"nextgen_{local_order.id}_{int(timezone.now().timestamp())}"

    try:
        provider_order_id = _razorpay_order_create(
            amount_paise=local_order.amount_paise,
            currency=local_order.currency,
            receipt=receipt,
            notes={
                "local_order_id": str(local_order.id),
                "plan": local_order.plan_name,
                "customer_email": local_order.customer_email,
            },
        )
    except ValueError as exc:
        local_order.status = PaymentStatus.FAILED
        local_order.failure_reason = str(exc)
        local_order.save(update_fields=["status", "failure_reason", "updated_at"])
        return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

    local_order.provider_order_id = provider_order_id
    local_order.save(update_fields=["provider_order_id", "updated_at"])

    return Response(
        {
            "local_order_id": local_order.id,
            "razorpay_order_id": provider_order_id,
            "key_id": settings.RAZORPAY_KEY_ID,
            "amount": local_order.amount_paise,
            "currency": local_order.currency,
            "plan_name": local_order.plan_name,
            "contact_commitment": "Payment successful. We will contact you within 1 hour regarding your selected service.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@csrf_protect
def create_manual_payment_order(request):
    if not settings.PAYMENTS_ENABLED:
        return Response(
            {"detail": "Payments are currently disabled."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    config_error = _manual_qr_config_error()
    if config_error:
        return Response(
            {"detail": config_error},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    serializer = PaymentOrderCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    plan = PLAN_CATALOG[data["plan_code"]]

    local_order = PaymentOrder.objects.create(
        plan_code=data["plan_code"],
        plan_name=plan["name"],
        amount_paise=plan["amount_paise"],
        currency=settings.PAYMENT_CURRENCY,
        customer_name=data["customer_name"],
        customer_email=data["customer_email"],
        customer_phone=data["customer_phone"],
        project_details=data.get("project_details", ""),
        payment_mode="manual_qr",
        provider="manual_qr",
    )

    payment_links = _build_upi_links(local_order)

    return Response(
        {
            "local_order_id": local_order.id,
            "plan_name": local_order.plan_name,
            "amount": local_order.amount_paise,
            "currency": local_order.currency,
            "amount_rupees": payment_links["amount_rupees"],
            "upi_uri": payment_links["upi_uri"],
            "qr_image_url": payment_links["qr_image_url"],
            "detail": "QR generated. Complete payment and submit transaction ID to receive your receipt.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@csrf_protect
def submit_manual_payment(request):
    serializer = ManualPaymentSubmitSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        local_order = PaymentOrder.objects.get(id=data["local_order_id"])
    except PaymentOrder.DoesNotExist:
        return Response(
            {"detail": "Invalid payment order."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if local_order.payment_mode != "manual_qr":
        return Response(
            {"detail": "This order is not a manual QR payment order."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    transaction_reference = data["transaction_reference"].strip()
    payer_name = data.get("payer_name", "").strip()

    if local_order.status == PaymentStatus.PAID:
        return Response(
            {
                "detail": "Payment is already verified.",
                "status": local_order.status,
                "receipt_id": f"NGS-{local_order.id:06d}",
            }
        )

    if local_order.status == PaymentStatus.SUBMITTED:
        return Response(
            {
                "detail": "Payment proof already submitted and is pending verification.",
                "status": local_order.status,
                "receipt_id": f"NGS-{local_order.id:06d}",
            }
        )

    duplicate_reference_exists = PaymentOrder.objects.filter(
        transaction_reference=transaction_reference
    ).exclude(id=local_order.id).exists()

    if duplicate_reference_exists:
        return Response(
            {"detail": "This transaction ID is already used for another order. Please verify and submit again."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    local_order.transaction_reference = transaction_reference
    local_order.payer_name = payer_name
    local_order.status = PaymentStatus.SUBMITTED
    local_order.provider_payment_id = transaction_reference
    local_order.paid_at = None
    local_order.failure_reason = ""
    local_order.save(
        update_fields=[
            "transaction_reference",
            "payer_name",
            "status",
            "provider_payment_id",
            "failure_reason",
            "updated_at",
        ]
    )

    notification_sent = True
    try:
        send_mail(
            subject=f"Payment proof submitted - {local_order.plan_name}",
            message=(
                f"Plan: {local_order.plan_name}\n"
                f"Amount: {local_order.amount_paise / 100:.2f} {local_order.currency}\n"
                f"Customer: {local_order.customer_name}\n"
                f"Email: {local_order.customer_email}\n"
                f"Phone: {local_order.customer_phone}\n"
                f"Payer Name: {local_order.payer_name or 'N/A'}\n"
                f"Transaction ID: {local_order.transaction_reference}\n"
                f"Status: {local_order.status}\n"
                f"Project Details: {local_order.project_details or 'N/A'}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
            fail_silently=False,
        )
    except Exception:
        notification_sent = False
        logger.exception("Failed to send manual payment notification for order id=%s", local_order.id)

    return Response(
        {
            "detail": "Payment proof submitted successfully. Verification is pending. We will confirm within 1 hour.",
            "status": local_order.status,
            "receipt_id": f"NGS-PENDING-{local_order.id:06d}",
            "transaction_reference": local_order.transaction_reference,
            "notification_sent": notification_sent,
        }
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
@csrf_protect
def verify_checkout_payment(request):
    serializer = PaymentVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    try:
        local_order = PaymentOrder.objects.get(id=data["local_order_id"])
    except PaymentOrder.DoesNotExist:
        return Response(
            {"detail": "Invalid payment order."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if local_order.provider_order_id != data["razorpay_order_id"]:
        return Response(
            {"detail": "Order verification mismatch."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if local_order.status == PaymentStatus.PAID:
        return Response(
            {
                "detail": "Payment already verified. We will contact you within 1 hour.",
                "status": local_order.status,
            }
        )

    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{data['razorpay_order_id']}|{data['razorpay_payment_id']}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, data["razorpay_signature"]):
        local_order.status = PaymentStatus.FAILED
        local_order.failure_reason = "Signature verification failed"
        local_order.save(update_fields=["status", "failure_reason", "updated_at"])
        return Response(
            {"detail": "Payment signature verification failed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    local_order.status = PaymentStatus.PAID
    local_order.provider_payment_id = data["razorpay_payment_id"]
    local_order.provider_signature = data["razorpay_signature"]
    local_order.paid_at = timezone.now()
    local_order.failure_reason = ""
    local_order.save(
        update_fields=[
            "status",
            "provider_payment_id",
            "provider_signature",
            "paid_at",
            "failure_reason",
            "updated_at",
        ]
    )

    notification_sent = True
    try:
        html_message = render_to_string(
            "emails/new_paid_order.html",
            {
                "order": local_order,
                "amount_rupees": f"{local_order.amount_paise / 100:.2f}",
            },
        )
        send_mail(
            subject=f"New paid order - {local_order.plan_name}",
            message=(
                f"Plan: {local_order.plan_name}\n"
                f"Amount: {local_order.amount_paise / 100:.2f} {local_order.currency}\n"
                f"Customer: {local_order.customer_name}\n"
                f"Email: {local_order.customer_email}\n"
                f"Phone: {local_order.customer_phone}\n"
                f"Payment ID: {local_order.provider_payment_id}\n"
                f"Project Details: {local_order.project_details or 'N/A'}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception:
        notification_sent = False
        logger.exception("Failed to send paid order email notification for order id=%s", local_order.id)

    return Response(
        {
            "detail": "Payment successful. We will contact you within 1 hour regarding your selected service.",
            "status": local_order.status,
            "notification_sent": notification_sent,
        }
    )


@csrf_exempt
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def razorpay_webhook(request):
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        return Response(
            {"detail": "Webhook secret not configured."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    signature = request.headers.get("X-Razorpay-Signature", "")
    expected_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        request.body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

    payload = json.loads(request.body.decode("utf-8"))
    event = payload.get("event", "")

    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    provider_order_id = payment_entity.get("order_id")
    provider_payment_id = payment_entity.get("id")

    if provider_order_id:
        order = PaymentOrder.objects.filter(provider_order_id=provider_order_id).first()
        if order:
            if event in {"payment.captured", "payment.authorized"}:
                if order.status != PaymentStatus.PAID:
                    order.status = PaymentStatus.PAID
                    order.provider_payment_id = provider_payment_id
                    order.paid_at = timezone.now()
                    order.failure_reason = ""
                    order.save(update_fields=["status", "provider_payment_id", "paid_at", "failure_reason", "updated_at"])
            elif event == "payment.failed":
                order.status = PaymentStatus.FAILED
                order.provider_payment_id = provider_payment_id
                order.failure_reason = payment_entity.get("error_description", "Payment failed")
                order.save(update_fields=["status", "provider_payment_id", "failure_reason", "updated_at"])

    return Response({"detail": "Webhook processed."})


class PaymentOrderAdminViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentOrderAdminSerializer
    queryset = PaymentOrder.objects.all()
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]
    pagination_class = None

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        order = serializer.save()
        status_changed = previous_status != order.status

        if status_changed and order.status == PaymentStatus.PAID and not order.paid_at:
            order.paid_at = timezone.now()
            order.save(update_fields=["paid_at", "updated_at"])

        if status_changed and order.status != PaymentStatus.PAID and order.paid_at:
            order.paid_at = None
            order.save(update_fields=["paid_at", "updated_at"])
