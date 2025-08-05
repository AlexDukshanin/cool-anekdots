from django.contrib import admin
from .models import Rating

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ("user","post","score","rated_at")
    list_filter = ("rated_at",'score')
    search_fields = ("user_email","post_title")
    
