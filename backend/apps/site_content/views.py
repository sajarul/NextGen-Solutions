from django.views.decorators.csrf import csrf_protect
from rest_framework import permissions, status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import SiteContent
from .serializers import SiteContentSerializer


def _get_or_create_site_content() -> SiteContent:
    site_content = SiteContent.objects.order_by("id").first()
    if site_content is None:
        site_content = SiteContent.objects.create()
    return site_content


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def public_site_content(request):
    site_content = _get_or_create_site_content()
    serializer = SiteContentSerializer(site_content, context={"request": request})
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
@csrf_protect
def admin_site_content(request):
    site_content = _get_or_create_site_content()

    if request.method == "GET":
        serializer = SiteContentSerializer(site_content, context={"request": request})
        return Response(serializer.data)

    serializer = SiteContentSerializer(
        site_content,
        data=request.data,
        partial=True,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)

