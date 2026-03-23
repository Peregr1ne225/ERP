from django.contrib import admin
from .models import MarketingCampaign, AdPerformanceDaily, WebsiteConversionDaily


@admin.register(MarketingCampaign)
class MarketingCampaignAdmin(admin.ModelAdmin):
    list_display = ("campaign_id", "campaign_name", "platform")
    search_fields = ("campaign_id", "campaign_name")
    list_filter = ("platform",)


@admin.register(AdPerformanceDaily)
class AdPerformanceDailyAdmin(admin.ModelAdmin):
    list_display = (
        "campaign",
        "date",
        "spend",
        "impressions",
        "link_clicks",
        "ctr",
        "cpc",
    )
    list_filter = ("date", "campaign__platform")
    search_fields = ("campaign__campaign_id",)
    readonly_fields = ("ctr", "cpc")


@admin.register(WebsiteConversionDaily)
class WebsiteConversionDailyAdmin(admin.ModelAdmin):
    list_display = (
        "campaign",
        "date",
        "page_views",
        "purchases",
        "purchase_value",
        "conversion_rate",
        "aov",
    )
    list_filter = ("date", "campaign__platform")
    search_fields = ("campaign__campaign_id",)
    readonly_fields = ("conversion_rate", "aov")
