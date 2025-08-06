from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from users.forms import PasswordChangeForm
from .models import CustomUser
from rest_framework.permissions import IsAuthenticated
from .serializers import UsersSerializer, RegisterSerializer, loginSerializer
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
from rest_framework.generics import RetrieveUpdateAPIView

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

    def get_object(self):
        return self.request.user
    
@login_required
def change_password_views(request):
    if request.method == "POST":
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, request.user)
            messages.success(request, "Пароль успешно изменен")
            return redirect('profile')  # проверь, чтобы 'profile' был в urls
    else:
        form = PasswordChangeForm(user=request.user)

    return render(request, 'users/change_password.html', {'form': form})