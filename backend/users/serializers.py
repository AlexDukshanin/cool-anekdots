from django.contrib.auth import authenticate

from rest_framework import serializers

from .models import CustomUser, UserAccessLog

LOCAL_LOGIN_DOMAIN = "local.molodoyded"


def login_to_email(login):
    return f"{login.strip().lower()}@{LOCAL_LOGIN_DOMAIN}"


class UsersSerializer(serializers.ModelSerializer):
    login = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    nickname = serializers.CharField(
        source='name',
        required=False,
        allow_blank=True,
        max_length=200,
    )

    def get_login(self, obj):
        suffix = f"@{LOCAL_LOGIN_DOMAIN}"
        if obj.email.endswith(suffix):
            return obj.email[:-len(suffix)]
        return obj.email

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get('request')
        url = obj.avatar.url
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = CustomUser
        fields = ('id','login','email','nickname','avatar','avatar_url','is_staff')

    def validate(self, attrs):
        nickname = attrs.get('name')
        if nickname is not None and not nickname.strip():
            raise serializers.ValidationError({'nickname': 'Введите никнейм'})
        if nickname is not None:
            nickname = nickname.strip()
            duplicate = CustomUser.objects.filter(name__iexact=nickname)
            if self.instance:
                duplicate = duplicate.exclude(pk=self.instance.pk)
            if duplicate.exists():
                raise serializers.ValidationError({'nickname': 'Такой никнейм уже занят'})
            attrs['name'] = nickname
        return attrs


class RegisterSerializer(serializers.Serializer):
    login = serializers.RegexField(
        regex=r'^[A-Za-z0-9_.-]{3,32}$',
        required=False,
        allow_blank=True,
        write_only=True,
        error_messages={
            "invalid": "Никнейм: 3-32 символа, латиница, цифры, точка, дефис или подчеркивание.",
        },
    )
    nickname = serializers.CharField(max_length=100, required=False, allow_blank=True)
    name = serializers.CharField(max_length=100, required=False, allow_blank=True, write_only=True)
    email = serializers.EmailField(max_length=200, required=False, allow_blank=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True, style={'input_type':'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type':'password'})

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Пароли не совпадают'})

        login = data.get('login', '').strip()
        email = data.get('email', '').strip()

        if not login and not email:
            raise serializers.ValidationError({'login': 'Введите никнейм'})

        if not email:
            email = login_to_email(login)

        if CustomUser.objects.filter(email__iexact=email).exists():
            field = 'login' if login else 'email'
            raise serializers.ValidationError({field: 'Такой пользователь уже существует'})

        nickname = (data.get('nickname') or '').strip()
        legacy_name = (data.get('name') or '').strip()
        nickname = nickname or legacy_name or login or email.split('@')[0]
        if CustomUser.objects.filter(name__iexact=nickname).exists():
            raise serializers.ValidationError({'login': 'Такой никнейм уже занят'})
        data['email'] = email.lower()
        data['name'] = nickname
        return data

    def create(self, validated_data):
        validated_data.pop('login', None)
        validated_data.pop('nickname', None)
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
            raise serializers.ValidationError("Введите никнейм или email")

        if '@' in identifier:
            user = authenticate(email=identifier, password=data['password'])
        else:
            user = authenticate(email=login_to_email(identifier), password=data['password'])
            if not user:
                user_by_nickname = CustomUser.objects.filter(name__iexact=identifier).first()
                if user_by_nickname:
                    user = authenticate(email=user_by_nickname.email, password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("неверный никнейм/email или пароль")


class UserSummarySerializer(UsersSerializer):
    class Meta(UsersSerializer.Meta):
        fields = ('id', 'login', 'email', 'nickname', 'avatar_url', 'is_active', 'is_staff')


class AdminUserSerializer(UsersSerializer):
    access_log_count = serializers.IntegerField(source='access_logs.count', read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta(UsersSerializer.Meta):
        fields = (
            'id',
            'login',
            'email',
            'nickname',
            'avatar',
            'avatar_url',
            'is_active',
            'is_staff',
            'is_superuser',
            'created_at',
            'registration_ip',
            'registration_user_agent',
            'last_login_at',
            'last_login_ip',
            'last_login_user_agent',
            'access_log_count',
        )
        read_only_fields = (
            'id',
            'login',
            'avatar_url',
            'is_staff',
            'is_superuser',
            'created_at',
            'registration_ip',
            'registration_user_agent',
            'last_login_at',
            'last_login_ip',
            'last_login_user_agent',
            'access_log_count',
        )


class UserAccessLogSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = UserAccessLog
        fields = (
            'id',
            'user',
            'event',
            'identifier',
            'ip_address',
            'user_agent',
            'path',
            'created_at',
        )
