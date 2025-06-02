# This file defines the URL routing for the Django 'core' project.
# It includes the admin site and the URLs from the 'home' app.

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('home.urls')),  # This line includes your app's URLs
]
