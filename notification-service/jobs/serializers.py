from rest_framework import serializers
from .models import JobListing, UserProfile


class JobListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobListing
        fields = ['id', 'title', 'company', 'location', 'url', 'source', 'status' ,'linkedin_job_id', 'created_at']