from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .admin_api import AdminUserViewSet, UserAccessLogViewSet


router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'access-logs', UserAccessLogViewSet, basename='admin-access-logs')

urlpatterns = [
    path('', include(router.urls)),
]
