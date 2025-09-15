from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsersViewsSet, RegisterView, LoginView, UserProfileView, ChangePasswordView

router = DefaultRouter()
router.register(r'users', UsersViewsSet) 

urlpatterns = [
    path('', include(router.urls)),  # Все URL от router (users/)
    path('register/', RegisterView.as_view(), name='register'),  # Регистрация
    path('login/', LoginView.as_view(), name='login'),  # Вход
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password')  # Профиль
]