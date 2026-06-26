from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, MultiPartParser

from .models import Testimonial
from .serializers import TestimonialSerializer


class TestimonialPublicViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Testimonial.objects.filter(is_published=True)


class TestimonialAdminViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    queryset = Testimonial.objects.all()
