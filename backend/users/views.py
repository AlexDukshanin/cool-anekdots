from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password

from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.exceptions import ValidationError
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema

from .audit import record_access_event, save_login_audit, save_registration_audit
from .models import CustomUser, UserAccessLog
from .serializers import ChangePasswordSerializer, RegisterSerializer, UsersSerializer, loginSerializer


class UsersViewsSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UsersSerializer
    permission_classes = [IsAdminUser]


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        save_registration_audit(user, request)
        record_access_event(
            UserAccessLog.REGISTRATION,
            request,
            user=user,
            identifier=request.data.get('login') or request.data.get('email') or '',
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UsersSerializer(user, context={'request': request}).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = loginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('login') or request.data.get('email') or ''
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError:
            record_access_event(
                UserAccessLog.LOGIN_FAILED,
                request,
                identifier=identifier,
            )
            raise

        user = serializer.validated_data
        save_login_audit(user, request)
        record_access_event(
            UserAccessLog.LOGIN_SUCCESS,
            request,
            user=user,
            identifier=identifier,
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UsersSerializer(user, context={'request': request}).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UsersSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    @api_view(['GET'])
    def current_user(request):
        user = request.user
        return Response({
            "username": user.username,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
        })


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]  # Требуется авторизация
    serializer_class = ChangePasswordSerializer

    @extend_schema(request=ChangePasswordSerializer)
    def post(self, request):
        user = request.user
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        old_password = data.get("old_password")
        new_password = data.get("new_password")
        new_password2 = data.get("new_password2")

        if not user.check_password(old_password):
            return Response({"old_password": ["Старый пароль неверный."]}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != new_password2:
            return Response({"new_password2": ["Пароли не совпадают."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
        except Exception as e:
            return Response({"new_password": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)

        return Response({"detail": "Пароль успешно изменён."}, status=status.HTTP_200_OK)
