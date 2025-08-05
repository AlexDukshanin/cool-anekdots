from rest_framework import serializers
from .models import Rating
from posts.models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'average_rating']

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'user', 'post', 'score', 'rated_at']
        read_only_fields = ['user', 'rated_at']