from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .serialisers import TagListView
from .views import PostViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("tags/", TagListView.as_view(), name="tag-list"),
]
