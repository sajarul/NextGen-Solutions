from django.db import models


class PortfolioCategory(models.TextChoices):
    POSTER = "poster", "Poster Design"
    SOCIAL = "social", "Social Media Posts"
    THUMBNAIL = "thumbnail", "YouTube Thumbnails"
    BUSINESS_CARD = "business_card", "Business Cards"
    WEDDING_CARD = "wedding_card", "Wedding Cards"
    BOOK_COVER = "book_cover", "Book Covers"


class PortfolioItem(models.Model):
    title = models.CharField(max_length=180)
    category = models.CharField(max_length=30, choices=PortfolioCategory.choices)
    description = models.TextField()
    image = models.ImageField(upload_to="portfolio/", blank=True, null=True)
    client = models.CharField(max_length=120, blank=True)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title
