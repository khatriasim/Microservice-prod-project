from django.shortcuts import render
from rest_framework import status, serializers, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RegisterSerializers, UserUpdateSerializer
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework_api_key.permissions import HasAPIKey
from django.core.cache import cache
import random
from .tasks import send_otp_email
from .models import UserProfiles, User
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .tokens import CustomRefreshToken
from drf_spectacular.utils import extend_schema, inline_serializer

@extend_schema(tags=['Auth'])
class RegisterView(APIView):
    @extend_schema(
        request=RegisterSerializers,
        responses={
            201: inline_serializer(
                name='RegisterResponse',
                fields={'message': serializers.CharField()},
            ),
            400: RegisterSerializers,
        },
    )
    def post(self, request):
        serializer = RegisterSerializers (data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProfiles.objects.create(user=user)
            otp = random.randint(100000, 999999)
            cache.set(f"otp:{user.email}", otp, 300)
            send_otp_email.delay(user.email, otp)
            return Response({'message': 'User creates sucessfully check your email to verify'}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=['Auth'])
class LoginView(APIView):
    @extend_schema(
        request=inline_serializer(
            name="LoginRequest",
            fields={
                'username': serializers.CharField(),
                'password': serializers.CharField(),
            },
        ),
        responses={
            200: inline_serializer(
                name='LoginResponse',
                fields={'message': serializers.CharField()},
            ),
            400: inline_serializer(
                name='EmailVerificationError',
                fields={'error': serializers.CharField()},
            ),
            401: inline_serializer(
                name='LoginError',
                fields={'message': serializers.CharField()},
            ),
        },
    )
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is  None:
            return Response(
                {'message': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        profile = UserProfiles.objects.get(user = user)
        if not profile.is_email_verified:
            return Response({'error':'email not verified'}, status=status.HTTP_400_BAD_REQUEST)
        

        refresh = CustomRefreshToken.for_user(user)
        access= str(refresh.access_token)
        refresh_token= str(refresh)
        
        response = Response(
            {'message': 'Login successful'},
            status=status.HTTP_200_OK
        )
        response.set_cookie(
            key='access_token',
            value = access,
            httponly = True,
            secure = not settings.DEBUG,
            samesite='Strict',
            max_age = 604800
        )

        response.set_cookie(
            key='refresh_token',
            value = refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Strict',
            max_age=86400 * 7,
        )

        return response

@extend_schema(tags=['Auth'])
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses=inline_serializer(
            name='ProfileResponse',
            fields={
                'username': serializers.CharField(),
                'email': serializers.EmailField(),
            },
        ),
    )
    def get(self, request):
        return Response({
        'username': request.user.username ,
        'email': request.user.email,
        })

@extend_schema(tags=['Auth'])
class ForgetPasswordView(APIView):
    @extend_schema(
        request=inline_serializer(
            name='ForgetPasswordRequest',
            fields={'email': serializers.EmailField()},
        ),
        responses=inline_serializer(
            name='OTPMessageResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(email=email).exists():
            return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)
        otp = random.randint(100000, 999999)
        cache.set(f"otp:{email}", otp, 300)
        send_otp_email.delay(email, otp)
        return Response({'message': 'OTP sent. Check email.'}, status=status.HTTP_200_OK)

@extend_schema(tags=['Auth'])
class ResetPassword(APIView):
    @extend_schema(
        request=inline_serializer(
            name='ResetPasswordRequest',
            fields={
                'email': serializers.EmailField(),
                'password': serializers.CharField(),
                'otp': serializers.CharField(),
            },
        ),
        responses=inline_serializer(
            name='ResetPasswordResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        otp = request.data.get('otp')
        stored_otp = cache.get(f"otp:{email}")
        if not stored_otp:
            return Response({'messsage':"otp expired resend otp"}, status=status.HTTP_400_BAD_REQUEST)
        if str(stored_otp) != str(otp):
            return Response ({"message":"otp not matched"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            cache.delete(f"otp:{email}")
            return Response({"message":"new password created"}, status=status.HTTP_201_CREATED)

@extend_schema(tags=['Auth'])
class LogoutView(APIView):
    @extend_schema(
        request=None,
        responses=inline_serializer(
            name='LogoutResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def post(self, request):
        response = Response({'message': 'Logged out'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
@extend_schema(tags=['Auth'])
class ResendOTPView(APIView):
    @extend_schema(
        request=inline_serializer(
            name='ResendOTPRequest',
            fields={'email': serializers.EmailField()},
        ),
        responses=inline_serializer(
            name='ResendOTPResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def post(self, request):
        email = request.data.get('email')
        if not User.objects.filter(email=email).exists():
            return Response({"error":"email not found"}, status=status.HTTP_400_BAD_REQUEST)
        profile = UserProfiles.objects.get(user__email=email)
        if profile.is_email_verified:
            return Response ({'message':"email already verified"}, status=status.HTTP_400_BAD_REQUEST)
        otp = random.randint(100000, 999999)
        cache.set(f"otp:{email}", otp)
        send_otp_email.delay(email, otp)
        return Response({"message":"otp resent"}, status=status.HTTP_200_OK)


@extend_schema(tags=['Auth'])
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=inline_serializer(
            name='ChangePasswordRequest',
            fields={
                'old_password': serializers.CharField(),
                'new_password': serializers.CharField(),
            },
        ),
        responses=inline_serializer(
            name='ChangePasswordResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response(
                {'error': "bothe old and new are required"}, status=status.HTTP_400_BAD_REQUEST
            )
        user= request.user

        if not user.check_password(old_password):
            return Response(
                {"error": "old passowrd is incorrect"}, status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(new_password)
        user.save()
        return Response(
            {
                "message":"Passowrd changed successfully"
            }, status=status.HTTP_200_OK
        )
    
@extend_schema(tags=['Auth'])
class UpdateProfileView(APIView):
    permission_classes =[IsAuthenticated]

    @extend_schema(
        request=UserUpdateSerializer,
        responses=inline_serializer(
            name='UpdateProfileResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def patch(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial= True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"profile updated sucessfully"}, status= status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(tags=['Auth'])
class VerifyOTPView(APIView):
    @extend_schema(
        request=inline_serializer(
            name='VerifyOTPRequest',
            fields={
                'email': serializers.EmailField(),
                'otp': serializers.CharField(),
            },
        ),
        responses=inline_serializer(
            name='VerifyOTPResponse',
            fields={'message': serializers.CharField()},
        ),
    )
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        stored_otp = cache.get(f"otp:{email}")
        if stored_otp is None:
            return Response({"message": "otp expired or not received"}, status=status.HTTP_400_BAD_REQUEST)
        elif str(stored_otp) == str(otp):
            user = User.objects.get(email=email)
            profile = UserProfiles.objects.get(user= user)
            profile.is_email_verified = True
            profile.save()
            cache.delete(f"otp:{email}")
            return Response({"message":"account verified"}, status=status.HTTP_200_OK)
        else:
            return Response({"message":"OTP not matched"}, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(tags=['Auth'])
class GoogleLoginView(APIView):
    @extend_schema(
        request=inline_serializer(
            name='GoogleLoginRequest',
            fields={'token': serializers.CharField()},
        ),
        responses=inline_serializer(
            name='GoogleLoginResponse',
            fields={
                'access': serializers.CharField(),
                'refresh': serializers.CharField(),
                'created': serializers.BooleanField(),
            },
        ),
    )
    def post(self, request):
        token = request.data.get('token')
        try:
            google_user = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = google_user['email']
            name = google_user['name']
            user, created = User.objects.get_or_create(email=email)
            refresh = CustomRefreshToken.for_user(user)
            return Response({
                'access' : str(refresh.access_token),
                'refresh': str(refresh),
                'created': created
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":"invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        
