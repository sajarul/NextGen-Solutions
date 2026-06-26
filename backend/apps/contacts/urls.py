from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContactMessageAdminViewSet, create_contact_message

admin_router = DefaultRouter()
admin_router.register("messages", ContactMessageAdminViewSet, basename="contact-admin")

urlpatterns = [
    path("messages/", create_contact_message, name="contact-message-create"),
    path("admin/", include(admin_router.urls)),
]
