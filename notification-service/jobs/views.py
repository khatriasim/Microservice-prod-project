from django.shortcuts import render
from .scraper import scrape_linkedin_jobs, save_jobs
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .tasks  import scrape_jobs_task
from rest_framework import viewsets, filters
from .serializers import JobListingSerializer
from .models import JobListing, UserProfile
from rest_framework.permissions import IsAuthenticated

class ScrapeJobView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        keyword = request.data.get('keyword', '')
        location = request.data.get('location', '')
        if not keyword or not location:
            return Response(
                {'error': 'keyword and location are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        task = scrape_jobs_task.delay(keyword, location, request.user.id)
        return Response({'message': 'Scraping started', 'task_id': task.id}, status=202)

class JobListingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = JobListingSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location']
    ordering = ['-created_at']
    permission_classes= [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = JobListing.objects.filter(userjobmatch__user=user).distinct()
      
        keyword = self.request.query_params.get('keyword')
        if keyword:
            queryset = queryset.filter(title__icontains = keyword)
        return queryset