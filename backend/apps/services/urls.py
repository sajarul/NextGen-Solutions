from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ServiceAdminViewSet, ServicePublicViewSet

public_router = DefaultRouter()
public_router.register("items", ServicePublicViewSet, basename="service-public")

admin_router = DefaultRouter()
admin_router.register("items", ServiceAdminViewSet, basename="service-admin")

urlpatterns = [
    path("", include(public_router.urls)),
    path("admin/", include(admin_router.urls)),
]

