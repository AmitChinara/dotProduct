# Django admin configuration for the 'home' app.
# Registers models to be managed via the Django admin interface.

from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Category)
admin.site.register(Transaction)
