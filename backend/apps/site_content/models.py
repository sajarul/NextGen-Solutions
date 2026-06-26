from django.db import models


class SiteContent(models.Model):
    about_video = models.FileField(upload_to="site/", blank=True, null=True)
    about_primary_image = models.ImageField(upload_to="site/", blank=True, null=True)
    about_secondary_image = models.ImageField(upload_to="site/", blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site Content"
        verbose_name_plural = "Site Content"

    def __str__(self) -> str:
        return f"Site Content #{self.id}"

