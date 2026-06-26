from django.contrib import admin

from .models import ServiceItem


@admin.register(ServiceItem)
class ServiceItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_published", "display_order", "updated_at")
    list_filter = ("category", "is_published")
    search_fields = ("title", "description")
    ordering = ("display_order", "-created_at")

