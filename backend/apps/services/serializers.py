from rest_framework import serializers

from .models import ServiceItem

SERVICE_CATEGORY_LABELS = {
    "poster": "Poster Design",
    "social": "Social Media",
    "thumbnail": "YouTube Thumbnails",
    "business_card": "Business Cards",
    "wedding_card": "Wedding Cards",
    "book_cover": "Book Covers",
}


class ServiceItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    category_label = serializers.SerializerMethodField()
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = ServiceItem
        fields = [
            "id",
            "title",
            "description",
            "category",
            "category_label",
            "badge_text",
            "tier_text",
            "cta_text",
            "is_published",
            "display_order",
            "image",
            "image_url",
            "remove_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        validated_data.pop("remove_image", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove_image = validated_data.pop("remove_image", False)
        if remove_image and instance.image:
            instance.image.delete(save=False)
            instance.image = None
        return super().update(instance, validated_data)

    def get_category_label(self, obj):
        key = (obj.category or "").strip().lower()
        return SERVICE_CATEGORY_LABELS.get(key, obj.category)

    def get_image_url(self, obj):
        request = self.context.get("request")
        if not obj.image:
            return None
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url
