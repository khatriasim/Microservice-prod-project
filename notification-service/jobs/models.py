from django.db import models
from django.contrib.auth.models import User

class JobListing(models.Model):
    title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    location = models.TextField()
    url = models.TextField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    source = models.TextField()
    STATUS = [
    ('scraped', 'scraped'),
    ('failed', 'failed'),
    ('sent', 'sent'),
    ]
    status = models.CharField(max_length=10, choices=STATUS, default='scraped')
    linkedin_job_id = models.CharField(max_length=200, unique=True)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    applied_job = models.ManyToManyField(JobListing, related_name='applied_job')
    JOB_TYPE = [
    ('full_time', 'Full Time'),
    ('part_time', 'Part Time'),
    ('remote', 'Remote'),
    ('contract', 'Contract'),
]
    job_type = models.CharField(max_length=20, choices=JOB_TYPE)
    job_keyword = models.TextField(blank=True, null=True)
    location_preference = models.TextField(blank=True, null=True)


class UserJobMatch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job = models.ForeignKey(JobListing, on_delete=models.CASCADE)

    title = models.CharField(max_length=500)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    link = models.TextField()

    searched_keyword = models.CharField(max_length=266)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'job']