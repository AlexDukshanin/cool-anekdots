from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'tags', 'content', 'created_at', 'author_id', 'average_rating', 'author_name']
