from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PortfolioAdminViewSet, PortfolioPublicViewSet, categories

public_router = DefaultRouter()
public_router.register("items", PortfolioPublicViewSet, basename="portfolio-public")

admin_router = DefaultRouter()
admin_router.register("items", PortfolioAdminViewSet, basename="portfolio-admin")

urlpatterns = [
    path("categories/", categories, name="portfolio-categories"),
    path("", include(public_router.urls)),
    path("admin/", include(admin_router.urls)),
]
