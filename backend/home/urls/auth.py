# URL patterns for authentication endpoints (login/logout) in the 'home' app.

from django.urls import path
from ..views.auth import loginView, logoutView

urlpatterns = [
    path('login/', loginView, name='login'),
    path('logout/', logoutView, name='logout'),
]

