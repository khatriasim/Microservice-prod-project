from rest_framework import serializers
from .models import Post, Comment, Category, Notification, Like
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id']


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    category_ids = serializers.PrimaryKeyRelatedField(
        many = True,
        queryset = Category.objects.all(),
        write_only=True,
        source='categories'
    )

    def get_author(self, obj):
        return obj.author.username

    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        return Comment.objects.filter(post=obj).count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(following=obj.author, follower=request.user).exists()
        return False
    
    def create(self, validated_data):
        categories = validated_data.pop('categories', [])
        post = Post.objects.create(**validated_data)
        post.categories.set(categories)
        return post
    
    def update(self, instance, validate_data):
        categories = validate_data.pop('categories', None)
        for attr, value in validate_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories is not None:
            instance.categories.set(categories)
        return instance
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'status','views', 'created_at', 'categories', 'category_ids', 'updated_at', 'likes_count', 'comments_count']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']



class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    def get_author(self, obj):
        return obj.author.username
    class Meta:
        model = Comment
        fields = ['author', 'content', 'post', 'created_at']
        read_only_fields = ['created_at', 'author', 'id', 'post']

class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    def get_sender(self, obj):
        return obj.sender.username
    
    class Meta:
        model = Notification
        fields = ['id', 'post', 'user', 'sender', 'created_at', 'notification_type', 'is_read']