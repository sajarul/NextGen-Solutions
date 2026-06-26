from rest_framework import serializers

from .models import PortfolioCategory, PortfolioItem


class PortfolioItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    category_label = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = PortfolioItem
        fields = [
            "id",
            "title",
            "category",
            "category_label",
            "description",
            "client",
            "is_featured",
            "is_published",
            "image",
            "image_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class PortfolioCategorySerializer(serializers.Serializer):
    key = serializers.CharField()
    label = serializers.CharField()

    @staticmethod
    def choices():
        return [{"key": key, "label": label} for key, label in PortfolioCategory.choices]
