from .views import RegisterView, LoginView, ProfileView, LogoutView, ChangePasswordView, UpdateProfileView
from .views import VerifyOTPView, GoogleLoginView, ResendOTPView, ResetPassword
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from drf_spectacular.utils import extend_schema

TaggedTokenRefreshView = extend_schema(tags=['Auth'])(TokenRefreshView)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('reset-password/', ResetPassword.as_view(), name='reset-password'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-user/', UpdateProfileView.as_view(), name='userprofileupdate'),
    path('token/refresh/', TaggedTokenRefreshView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
]
