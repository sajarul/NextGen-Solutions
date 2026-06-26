from rest_framework import serializers

from .models import PaymentOrder, PaymentPlan


class PaymentOrderCreateSerializer(serializers.Serializer):
    plan_code = serializers.ChoiceField(choices=PaymentPlan.choices)
    customer_name = serializers.CharField(max_length=120, min_length=2)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=30, min_length=8)
    project_details = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class PaymentVerifySerializer(serializers.Serializer):
    local_order_id = serializers.IntegerField(min_value=1)
    razorpay_order_id = serializers.CharField(max_length=120)
    razorpay_payment_id = serializers.CharField(max_length=120)
    razorpay_signature = serializers.CharField(max_length=256)


class ManualPaymentSubmitSerializer(serializers.Serializer):
    local_order_id = serializers.IntegerField(min_value=1)
    transaction_reference = serializers.RegexField(
        regex=r"^[A-Za-z0-9\-_\/]{6,64}$",
        max_length=64,
        min_length=6,
        error_messages={
            "invalid": "Enter a valid transaction ID/UTR (letters, numbers, -, _, /).",
        },
    )
    payer_name = serializers.CharField(max_length=120, required=False, allow_blank=True)


class PaymentOrderAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentOrder
        fields = [
            "id",
            "plan_code",
            "plan_name",
            "amount_paise",
            "currency",
            "customer_name",
            "customer_email",
            "customer_phone",
            "project_details",
            "payment_mode",
            "payer_name",
            "transaction_reference",
            "status",
            "provider",
            "provider_order_id",
            "provider_payment_id",
            "failure_reason",
            "paid_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "provider",
            "provider_order_id",
            "provider_payment_id",
            "paid_at",
            "created_at",
            "updated_at",
        ]
