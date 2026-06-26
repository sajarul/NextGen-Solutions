from rest_framework import permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import PortfolioItem
from .serializers import PortfolioCategorySerializer, PortfolioItemSerializer


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def categories(request):
    return Response({"results": PortfolioCategorySerializer.choices()})


class PortfolioPublicViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PortfolioItemSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        queryset = PortfolioItem.objects.filter(is_published=True)
        category = self.request.query_params.get("category")
        if category and category != "all":
            queryset = queryset.filter(category=category)
        return queryset


class PortfolioAdminViewSet(viewsets.ModelViewSet):
    serializer_class = PortfolioItemSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = None
    queryset = PortfolioItem.objects.all()
