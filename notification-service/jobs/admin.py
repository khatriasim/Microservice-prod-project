from django.contrib import admin
from .models import JobListing, UserProfile, UserJobMatch

admin.site.register(JobListing)
admin.site.register(UserProfile)
admin.site.register(UserJobMatch)