from django.urls import path
from .views import RatingCreateAPIView

urlpatterns = [
    path('ratings/', RatingCreateAPIView.as_view(), name='rating-create'),
]