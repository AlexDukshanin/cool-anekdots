from rest_framework import serializers, generics
from .models import Post
from taggit.models import Tag



class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["name"]

class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class PostSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)

    def get_tags(self, obj):
        return list(obj.tags.values_list('name', flat=True))

    class Meta:
        model = Post
        fields = ['id', 'title', 'tags', 'content', 'created_at', 'author_id', 'average_rating', 'author_name']

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set(*tags)  # Перезаписываем список тегов
        return instance

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        instance = super().create(validated_data)
        instance.tags.add(*tags)
        return instance

