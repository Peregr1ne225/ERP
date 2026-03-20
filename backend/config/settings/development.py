import os
from pathlib import Path

import environ

from .base import *  # noqa: F403

# Get BASE_DIR from base settings
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Initialize environment variables
env = environ.Env()
env.read_env(os.path.join(BASE_DIR, ".env"))

# Development specific settings - override from environment
DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = ["*"]

# Email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# CORS settings for development with Next.js frontend - override from environment
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",  # For direct backend access
        "http://127.0.0.1:8000",  # For direct backend access
    ],
)

CORS_ALLOW_CREDENTIALS = True

# CSRF settings - override from environment
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)

# Static files for development
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
