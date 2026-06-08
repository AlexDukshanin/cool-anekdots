from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email','nickname','created_at','is_staff')
    list_filter = ("is_staff", "is_active")
    ordering = ('email',)
    search_fields = ('email','name')

    @admin.display(description='Никнейм')
    def nickname(self, obj):
        return obj.name

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Профиль',
         {'fields': ('name', 'avatar')})
         ,
        ('Права доступа', 
         {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}
         ),
        ('Важные даты', 
         {'fields': ('last_login',)}
         ),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'avatar', 'password1', 'password2'),
        }),
    
    )

admin.site.register(CustomUser, CustomUserAdmin)
