from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Like, Comment, Follow, Notification, LikeComment

@receiver(post_save, sender=Like)
def like_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(user=instance.post.author, sender=instance.user, notification_type = 'like', post = instance.post)

@receiver(post_save, sender=LikeComment)
def like_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(user=instance.comment.author, sender=instance.user, notification_type = 'like-comment', post = instance.comment.post)


@receiver(post_save, sender=Comment)
def comment_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(user = instance.post.author, sender = instance.author, notification_type = 'comment', post = instance.post)

@receiver(post_save, sender=Follow)
def follow_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(user = instance.following, sender = instance.follower, notification_type = 'follow', post=None)