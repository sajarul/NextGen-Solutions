from django.contrib import admin

from .models import PortfolioItem


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_featured", "is_published", "created_at")
    list_filter = ("category", "is_featured", "is_published")
    search_fields = ("title", "client")
