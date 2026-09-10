from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

@shared_task
def send_otp_email(email, otp):
    send_mail(
        subject='verify yout email',
        message= f'yout OTP is : {otp} \n This otp expires in 5 minutes.',
        from_email='khatriasim111@gmail.com',
        recipient_list=[email],
    )

@shared_task
def send_property_notification(property_data):
    User = get_user_model()
    user_emails = list(
        User.objects.filter(is_active=True).values_list('email', flat=True)
    )
    user_emails= [email for email in user_emails if email]

    if not user_emails:
        print("No user emails found - skippping notification")
        return

    subject = f"New property listed :{property_data.get('title')}"
    message = (
        f"A new property has just beedn  listed!\n\n"
        f"Title: {property_data.get('title')}\n"
        f"City: {property_data.get('city')}\n"
        f"Price: ${property_data.get('price')}\n"
        f"Listed by: {property_data.get('agent_name')}\n"
    )

    send_mail(
        subject,
        message,
        'Khatriasim111@gmail.com',
        user_emails,
        fail_silently=False
    )

    print(f"Notification sent to {len(user_emails)} users")