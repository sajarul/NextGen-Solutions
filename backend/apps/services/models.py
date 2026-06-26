from django.db import models


class ServiceItem(models.Model):
    title = models.CharField(max_length=160)
    description = models.TextField()
    category = models.CharField(max_length=120)
    image = models.ImageField(upload_to="services/", blank=True, null=True)
    badge_text = models.CharField(max_length=40, default="Design Service")
    tier_text = models.CharField(max_length=40, default="Premium")
    cta_text = models.CharField(max_length=60, default="Request this service")
    is_published = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "-created_at"]

    def __str__(self) -> str:
        return self.title
