from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email','password']

    def validate_password(self, value):
         if len(value) < 8:
              raise serializers.ValidationError('Password must be at least 8 char')
         if not any(character.isdigit() for character in value):
              raise serializers.ValidationError("must contian an digit")
         return value
    
    def validate_username(self, value):
         if len(value) < 3:
              raise serializers.ValidationError("username must be at least 3 char")
         return value
    
    def validate_email(self, value):
         if User.objects.filter(email=value).exists():
              raise serializers.ValidationError("email already exists")
         return value

    def create(self, validated_data):
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )

            return user
    
class UserUpdateSerializer(serializers.ModelSerializer):
     class Meta:
          model = User
          fields = ['username', 'email']

     def validate_username(self, value):
          if len(value) < 3:
               raise serializers.ValidationError("username must be greater than 3")
          return value
     
     def validate_email(self, value):
          if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
               raise serializers.ValidationError("email alredy in use")
          return value