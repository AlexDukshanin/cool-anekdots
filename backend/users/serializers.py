from rest_framework import serializers
from .models import CustomUser
from rest_framework.validators import UniqueValidator
from django.contrib.auth import authenticate

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id','email','name','age','avatar','is_staff')

class RegisterSerializer(serializers.Serializer):
        model = CustomUser
        name = serializers.CharField(max_length=100, required=True)
        email = serializers.EmailField(max_length=200, required=True, validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="Этот email уже используется.")]
    )
        age = serializers.IntegerField(required=True)
        avatar = serializers.ImageField(required=False, allow_null=True)
        password = serializers.CharField(write_only=True, style={'input_type':'password'})
        password2 = serializers.CharField(write_only=True, style={'input_type':'password'})

        def validate(self,data):
            if data['password'] != data['password2']:
                raise serializers.ValidationError('пароли не совпадают')
            return data

        def create(self, validated_data):
            validated_data.pop('password2')
            user = CustomUser.objects.create_user(**validated_data)
            return user
        
class loginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("неверный логин или пароль")
        