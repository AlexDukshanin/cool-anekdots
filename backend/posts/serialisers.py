from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'tags', 'content', 'created_at', 'average_rating', 'author_name']
