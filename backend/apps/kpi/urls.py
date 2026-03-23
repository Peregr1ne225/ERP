from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarketingCampaignViewSet,
    AdPerformanceDailyViewSet,
    WebsiteConversionDailyViewSet,
)

router = DefaultRouter()
router.register(r"campaigns", MarketingCampaignViewSet)
router.register(r"ad-performance", AdPerformanceDailyViewSet)
router.register(r"website-conversions", WebsiteConversionDailyViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
