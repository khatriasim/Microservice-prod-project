from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from blog.views import dashboard_index, dashboard_users,dashboard_posts, dashboard_jobs, dashboard_notification, blog_category, edit_category, delete_category, edit_post, delete_post, delete_user

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login.html', TemplateView.as_view(template_name='login_test.html'), name='login-test'),
    path('chat-test.html', TemplateView.as_view(template_name='chat_test.html'), name='chat-test'),
    path('api/', include('myapp.urls')),
    path('accounts/', include('allauth.urls')),  
    path('api/blog/', include('blog.urls')),  
    path('api/job/', include('jobs.urls')),  
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('dashboard/',        dashboard_index, name='dashboard'),
    path('dashboard/users/',  dashboard_users, name='dashboard-users'),
    path('dashboard/user/delete/<int:pk>/',      delete_user, name='delete-user'), 
    path('dashboard/posts/',  dashboard_posts, name='dashboard-posts'),
    path('dashboard/post/edit/<int:pk>/',       edit_post,  name='edit-post'),   
    path('dashboard/blog/category/delete/<int:pk>/',      delete_post, name='delete-post'),
    path('dashboard/jobs/',   dashboard_jobs,  name='dashboard-jobs'),
    path('dashboard/blog/category/',                      blog_category,  name='blog-category'),
    path('dashboard/blog/category/edit/<int:pk>/',        edit_category,  name='edit-category'),   
    path('dashboard/blog/category/delete/<int:pk>/',      delete_category, name='delete-category'), 
    path('dashboard/notification/',   dashboard_notification,  name='dashboard-notifications'),
    path('__reload__/', include('django_browser_reload.urls')),
    path('api/chat/', include('chat.urls')),
]
