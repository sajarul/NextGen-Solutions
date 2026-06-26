from django.contrib import admin

from .models import Testimonial


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("client_name", "rating", "is_featured", "is_published", "created_at")
    list_filter = ("rating", "is_featured", "is_published")
    search_fields = ("client_name", "review")
