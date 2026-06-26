from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/portfolio/", include("apps.portfolio.urls")),
    path("api/testimonials/", include("apps.testimonials.urls")),
    path("api/contacts/", include("apps.contacts.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/site/", include("apps.site_content.urls")),
    path("api/services/", include("apps.services.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
