from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TestimonialAdminViewSet, TestimonialPublicViewSet

public_router = DefaultRouter()
public_router.register("items", TestimonialPublicViewSet, basename="testimonial-public")

admin_router = DefaultRouter()
admin_router.register("items", TestimonialAdminViewSet, basename="testimonial-admin")

urlpatterns = [
    path("", include(public_router.urls)),
    path("admin/", include(admin_router.urls)),
]
