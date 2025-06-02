"""
WSGI config for core project.

This file exposes the WSGI callable as a module-level variable named ``application``.
It is used for deploying the Django project using WSGI servers.
For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()
