from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from .models import CustomUser
from rest_framework.permissions import IsAuthenticated
from .serializers import UsersSerializer, RegisterSerializer, loginSerializer
from django.contrib.auth import update_session_auth_hash
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash
from rest_framework import status





class UsersViewsSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UsersSerializer
    permission_classes = [IsAuthenticated]

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UsersSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)
    
class LoginView(generics.GenericAPIView):
    serializer_class = loginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UsersSerializer(user).data,
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

    def post(self, request):
        user = request.user
        data = request.data

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
    

    