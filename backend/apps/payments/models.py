from django.db import models


class PaymentPlan(models.TextChoices):
    BASIC = "basic", "Basic Plan"
    STANDARD = "standard", "Standard Plan"
    PREMIUM = "premium", "Premium Plan"


class PaymentStatus(models.TextChoices):
    CREATED = "created", "Created"
    SUBMITTED = "submitted", "Submitted"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"


class PaymentOrder(models.Model):
    plan_code = models.CharField(max_length=20, choices=PaymentPlan.choices)
    plan_name = models.CharField(max_length=100)
    amount_paise = models.PositiveIntegerField()
    currency = models.CharField(max_length=8, default="INR")

    customer_name = models.CharField(max_length=120)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30)
    project_details = models.TextField(blank=True)
    payment_mode = models.CharField(max_length=30, default="razorpay")
    payer_name = models.CharField(max_length=120, blank=True)
    transaction_reference = models.CharField(max_length=120, blank=True)

    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.CREATED)
    provider = models.CharField(max_length=30, default="razorpay")
    provider_order_id = models.CharField(max_length=120, null=True, blank=True, unique=True)
    provider_payment_id = models.CharField(max_length=120, null=True, blank=True, unique=True)
    provider_signature = models.CharField(max_length=256, blank=True)

    failure_reason = models.TextField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.plan_name} | {self.customer_name} | {self.status}"
