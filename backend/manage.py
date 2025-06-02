#!/usr/bin/env python
"""Django's command-line utility for administrative tasks.

This script is the entry point for running Django management commands,
such as running the development server, applying migrations, or creating apps.
"""

import os
import sys

def main():
    """Run administrative tasks.

    Sets the default settings module and executes the command-line utility.
    """
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        # Raised if Django isn't installed or not available in the environment.
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
