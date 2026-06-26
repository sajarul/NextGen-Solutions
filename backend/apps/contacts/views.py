from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import logging

from .models import ContactMessage
from .serializers import ContactMessageAdminSerializer, ContactMessageCreateSerializer

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def create_contact_message(request):
    serializer = ContactMessageCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    message = serializer.save()

    html_message = render_to_string(
        "emails/new_contact_message.html",
        {
            "name": message.name,
            "email": message.email,
            "message": message.message,
        },
    )

    notification_sent = True
    try:
        send_mail(
            subject=f"New website enquiry from {message.name}",
            message=(
                f"Name: {message.name}\n"
                f"Email: {message.email}\n\n"
                f"Message:\n{message.message}"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_NOTIFICATION_EMAIL],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception:
        notification_sent = False
        logger.exception("Failed to send contact notification email for message id=%s", message.id)

    return Response(
        {
            "detail": (
                "Thank you! Your message has been sent successfully."
                if notification_sent
                else "Thank you! Your message was saved successfully."
            ),
            "message": ContactMessageCreateSerializer(message).data,
            "notification_sent": notification_sent,
        },
        status=status.HTTP_201_CREATED,
    )


class ContactMessageAdminViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageAdminSerializer
    queryset = ContactMessage.objects.all()
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]
