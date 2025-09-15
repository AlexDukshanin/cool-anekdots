from django.apps import AppConfig

class PostsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'posts'

    def ready(self):
        from taggit.models import Tag
        default_tags = [
            "on_moderated",
            "published",
            "django",
            "python",
            "funny",
            "news"
        ]
        for tag_name in default_tags:
            Tag.objects.get_or_create(name=tag_name)