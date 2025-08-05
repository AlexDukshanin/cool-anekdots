from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email','name','age','created_at','is_staff')
    ordering = ('email',)
    search_fields = ('email','name')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Личная информация', 
         {'fields': ('name', 'age', 'avatar')})
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
            'fields': ('email', 'name', 'age', 'avatar', 'password1', 'password2'),
        }),
    
    )

admin.site.register(CustomUser, CustomUserAdmin)