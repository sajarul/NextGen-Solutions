from django.urls import path

from .views import admin_site_content, public_site_content

urlpatterns = [
    path("content/", public_site_content, name="public-site-content"),
    path("admin/content/", admin_site_content, name="admin-site-content"),
]

