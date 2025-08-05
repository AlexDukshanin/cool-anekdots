from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from django.contrib.auth import password_validation


class CoustunUserCreate(UserCreationForm):
    email = forms.EmailField(required=True, label="Почта пользователя")
    name = forms.CharField(required=True, label="Имя пользователя ")

    class Meta:
        model = CustomUser
        fields = ("email","name", "password1","password2")

    def save(self, commit = True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.name = self.cleaned_data["name"]
        if commit:
            user.save()
        return user

class UserUpsateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ["name", "email", "age", "avatar"]

class PasswordChangeForm(forms.Form):
    old_password = forms.CharField(
        label="Старый пароль",
        widget=forms.PasswordInput(attrs={"autocomplete":"current-password"})
    )

    new_password1 = forms.CharField(
        label="Введите новый пароль",
        widget=forms.PasswordInput(attrs={"autocomplete":"new-password"}),
        help_text=password_validation.password_validators_help_text_html(),
    )

    new_password2 = forms.CharField(
        label="Подтвердите пароль",
        widget=forms.PasswordInput(attrs={"autocomplete":"new-password"})
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user 
        super().__init__(*args, **kwargs)
    
    def clean_old_password(self):
        old_password = self.cleaned_data("old_Password")
        if not self.user.check_password(old_password):
            raise forms.ValidationError("Старарый пароль указан неверно")
        return old_password
    
    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("new_password1")
        password2 = cleaned_data.get("new_password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Введеные пароли не совпадают")
        password_validation.validate_password(password1, self.user)
        return cleaned_data
    
    def save(self, commit=True):
        password = self.cleaned_data["new_password1"]
        self.user.set_password(password)
        if commit:
            self.user.save()
            return self.user