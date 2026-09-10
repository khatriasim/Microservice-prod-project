from django.contrib import admin
from .models import UserProfiles

@admin.register(UserProfiles)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_email', 'is_email_verified']

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'