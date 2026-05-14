from .base import *  # noqa: F403
from .base import env

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# ALLOWED_HOSTS should be set in environment variables
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["backend", "localhost"])

# Secure Proxy SSL Header
# This is needed if the app is behind a load balancer that handles SSL
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CORS settings for production
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])

# Security settings for production
# SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
# SESSION_COOKIE_SECURE = True
# CSRF_COOKIE_SECURE = True
# SECURE_HSTS_SECONDS = 31536000  # 1 year
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True
# SECURE_CONTENT_TYPE_NOSNIFF = True

# WhiteNoise is already added in base.py MIDDLEWARE
