from django.urls import path
from .views import ScrapeJobView, JobListingViewSet

urlpatterns = [
    path('scrape/', ScrapeJobView.as_view()),
    path('list-job/', JobListingViewSet.as_view({'get':'list'})),
]