#!/usr/bin/env python3
"""
Django command-line utility for KIRA Health Assistant.
"""

import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django could not be imported. "
            "Make sure the backend dependencies are installed."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
