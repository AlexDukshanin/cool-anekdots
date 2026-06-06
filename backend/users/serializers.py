from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

LOCAL_LOGIN_DOMAIN = "local.molodoyded"


def login_to_email(login):
    return f"{login.strip().lower()}@{LOCAL_LOGIN_DOMAIN}"


class UsersSerializer(serializers.ModelSerializer):
    login = serializers.SerializerMethodField()

    def get_login(self, obj):
        suffix = f"@{LOCAL_LOGIN_DOMAIN}"
        if obj.email.endswith(suffix):
            return obj.email[:-len(suffix)]
        return obj.email

    class Meta:
        model = CustomUser
        fields = ('id','login','email','name','age','avatar','is_staff')

class RegisterSerializer(serializers.Serializer):
    login = serializers.RegexField(
        regex=r'^[A-Za-z0-9_.-]{3,32}$',
        required=False,
        allow_blank=True,
        write_only=True,
        error_messages={
            "invalid": "Логин: 3-32 символа, латиница, цифры, точка, дефис или подчеркивание.",
        },
    )
    name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    email = serializers.EmailField(max_length=200, required=False, allow_blank=True)
    age = serializers.DateField(required=False, allow_null=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True, style={'input_type':'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type':'password'})

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают'})

        login = data.get('login', '').strip()
        email = data.get('email', '').strip()

        if not login and not email:
            raise serializers.ValidationError({'login': 'Введите логин'})

        if not email:
            email = login_to_email(login)

        if CustomUser.objects.filter(email__iexact=email).exists():
            field = 'login' if login else 'email'
            raise serializers.ValidationError({field: 'Такой пользователь уже существует'})

        data['email'] = email.lower()
        data['name'] = data.get('name') or login or email.split('@')[0]
        return data

    def create(self, validated_data):
        validated_data.pop('login', None)
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class loginSerializer(serializers.Serializer):
    login = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField()

    def validate(self, data):
        identifier = (data.get('login') or data.get('email') or '').strip()
        if not identifier:
            raise serializers.ValidationError("Введите логин или email")

        email = identifier if '@' in identifier else login_to_email(identifier)
        user = authenticate(email=email, password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("неверный логин или пароль")
