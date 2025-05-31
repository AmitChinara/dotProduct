from django.urls import path
from ..views.auth import loginView, logoutView  # example views

urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
]
