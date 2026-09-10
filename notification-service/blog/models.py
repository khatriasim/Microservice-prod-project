from django.db import models
from django.contrib.auth.models import User



class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
      

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    categories = models.ManyToManyField(Category, blank=True)
    views = models.IntegerField(default = 0)
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'published'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status'], name='post_status_idx'),
            models.Index(fields=['created_at'], name='post_created_idx'),
            models.Index(fields=['title'], name='post_title_idx'),
            models.Index(fields=['author', 'status'], name='post_author_status_idx'),
    ]

    def __str__(self):
        return self.title 

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class Like(models.Model):

    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['post', 'user']


class LikeComment(models.Model):

    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['comment', 'user']


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'following']


class Notification(models.Model):
    NOTIFICATION_CHOICE =[
        ("like", "like"),
        ("comment", "comment"),
        ("like-comment", "like-comment"),
        ("follow", "follow"),
        ("new_post", "new_post")
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_CHOICE)  # ← missing
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True)   # ← missing (optional, follow has no post)
    is_read = models.BooleanField(default=False)                          
    created_at = models.DateTimeField(auto_now_add=True)