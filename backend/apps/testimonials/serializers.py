from rest_framework import serializers

from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = [
            "id",
            "client_name",
            "rating",
            "review",
            "client_role",
            "profile_image",
            "profile_image_url",
            "is_featured",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_profile_image_url(self, obj):
        request = self.context.get("request")
        if not obj.profile_image:
            return None
        if request:
            return request.build_absolute_uri(obj.profile_image.url)
        return obj.profile_image.url
