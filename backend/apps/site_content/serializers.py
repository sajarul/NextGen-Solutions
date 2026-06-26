from rest_framework import serializers

from .models import SiteContent


class SiteContentSerializer(serializers.ModelSerializer):
    about_video_url = serializers.SerializerMethodField()
    about_primary_image_url = serializers.SerializerMethodField()
    about_secondary_image_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteContent
        fields = [
            "id",
            "about_video",
            "about_video_url",
            "about_primary_image",
            "about_primary_image_url",
            "about_secondary_image",
            "about_secondary_image_url",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def _build_media_url(self, media_field):
        if not media_field:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(media_field.url)
        return media_field.url

    def get_about_video_url(self, obj):
        return self._build_media_url(obj.about_video)

    def get_about_primary_image_url(self, obj):
        return self._build_media_url(obj.about_primary_image)

    def get_about_secondary_image_url(self, obj):
        return self._build_media_url(obj.about_secondary_image)

