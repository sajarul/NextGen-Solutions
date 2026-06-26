from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from apps.portfolio.models import PortfolioCategory, PortfolioItem
from apps.services.models import ServiceItem
from apps.testimonials.models import Testimonial


class Command(BaseCommand):
    help = "Seed initial admin user, portfolio items, services, and testimonials."

    def handle(self, *args, **options):
        username = "sksajarulhoque@gmail.com"
        password = "sk.sajarul7"

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": username,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        if created:
            user.set_password(password)
            user.save(update_fields=["password"])
            self.stdout.write(self.style.SUCCESS("Created initial admin user."))
        else:
            self.stdout.write("Initial admin user already exists.")

        sample_items = [
            {
                "title": "Bold Brand Launch Poster",
                "category": PortfolioCategory.POSTER,
                "description": "A high-impact campaign poster with typography-forward layout.",
                "client": "Urban Fest",
                "is_featured": True,
            },
            {
                "title": "Product Promo Social Set",
                "category": PortfolioCategory.SOCIAL,
                "description": "Carousel-ready visual pack for Instagram and Facebook ads.",
                "client": "GlowCraft",
                "is_featured": True,
            },
            {
                "title": "High CTR Thumbnail Series",
                "category": PortfolioCategory.THUMBNAIL,
                "description": "YouTube thumbnail system optimized for scroll-stopping contrast.",
                "client": "Creator Hub",
            },
            {
                "title": "Luxury Corporate Card",
                "category": PortfolioCategory.BUSINESS_CARD,
                "description": "Foil-inspired premium card concept with minimal geometry.",
                "client": "Aster Consulting",
            },
            {
                "title": "Elegant Wedding Invite",
                "category": PortfolioCategory.WEDDING_CARD,
                "description": "Bespoke invitation suite blending modern and classic motifs.",
                "client": "Private Client",
            },
            {
                "title": "Mystery Novel Cover",
                "category": PortfolioCategory.BOOK_COVER,
                "description": "Dark cinematic cover concept with layered texture and mood.",
                "client": "Inkline Publishing",
            },
        ]

        for item in sample_items:
            PortfolioItem.objects.get_or_create(title=item["title"], defaults=item)

        sample_services = [
            {
                "title": "Poster Design",
                "description": "Campaign posters built for instant visual impact and brand recall.",
                "category": PortfolioCategory.POSTER,
                "display_order": 1,
            },
            {
                "title": "Social Media Posts",
                "description": "High-conversion static and carousel creatives optimized for engagement.",
                "category": PortfolioCategory.SOCIAL,
                "display_order": 2,
            },
            {
                "title": "YouTube Thumbnails",
                "description": "Scroll-stopping thumbnails engineered for stronger click-through rates.",
                "category": PortfolioCategory.THUMBNAIL,
                "display_order": 3,
            },
            {
                "title": "Business Card Design",
                "description": "Premium identity cards crafted to leave a lasting first impression.",
                "category": PortfolioCategory.BUSINESS_CARD,
                "display_order": 4,
            },
            {
                "title": "Wedding Card Design",
                "description": "Elegant invitations balancing timeless aesthetics with modern details.",
                "category": PortfolioCategory.WEDDING_CARD,
                "display_order": 5,
            },
            {
                "title": "Book Cover Design",
                "description": "Cover systems that translate story tone into a market-ready visual.",
                "category": PortfolioCategory.BOOK_COVER,
                "display_order": 6,
            },
        ]

        for item in sample_services:
            ServiceItem.objects.get_or_create(title=item["title"], defaults=item)

        sample_testimonials = [
            {
                "client_name": "Rohan Sen",
                "client_role": "Startup Founder",
                "rating": 5,
                "review": "NextGen Solutions translated our ideas into visuals that immediately improved engagement.",
                "is_featured": True,
            },
            {
                "client_name": "Nazia Ahmed",
                "client_role": "Marketing Manager",
                "rating": 5,
                "review": "Clean execution, quick turnaround, and revisions were handled professionally.",
                "is_featured": True,
            },
            {
                "client_name": "Arjun Dey",
                "client_role": "YouTube Creator",
                "rating": 5,
                "review": "Thumbnail redesign helped us boost click-through rates in just two weeks.",
            },
        ]

        for item in sample_testimonials:
            Testimonial.objects.get_or_create(
                client_name=item["client_name"],
                defaults=item,
            )

        self.stdout.write(self.style.SUCCESS("Seed data check complete."))
