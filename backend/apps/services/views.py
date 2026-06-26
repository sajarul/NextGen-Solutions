from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from .models import ServiceItem
from .serializers import ServiceItemSerializer


class ServicePublicViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return ServiceItem.objects.filter(is_published=True)


class ServiceAdminViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = None
    queryset = ServiceItem.objects.all()

