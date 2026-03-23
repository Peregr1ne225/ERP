from django.db import models


class MarketingCampaign(models.Model):
    PLATFORM_CHOICES = [
        ("Facebook", "Facebook"),
        ("TikTok", "TikTok"),
        ("Google", "Google"),
        ("Shopee Ads", "Shopee Ads"),
    ]
    campaign_id = models.CharField(max_length=50, primary_key=True)
    campaign_name = models.CharField(max_length=255)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)

    def __str__(self):
        return f"{self.campaign_id} - {self.campaign_name}"


class AdPerformanceDaily(models.Model):
    date = models.DateField()
    campaign = models.ForeignKey(
        MarketingCampaign, on_delete=models.CASCADE, related_name="ad_performance"
    )
    spend = models.DecimalField(max_digits=10, decimal_places=2)
    impressions = models.IntegerField(default=0)
    reach = models.IntegerField(default=0)
    link_clicks = models.IntegerField(default=0)
    video_views = models.IntegerField(default=0)
    engagement = models.IntegerField(default=0)

    @property
    def ctr(self) -> float:
        if self.impressions == 0:
            return 0.0
        return round((self.link_clicks / self.impressions) * 100.0, 2)

    @property
    def cpc(self) -> float:
        if self.link_clicks == 0:
            return 0.0
        return round(float(self.spend) / self.link_clicks, 2)

    def __str__(self):
        return f"{self.campaign_id} - {self.date}"


class WebsiteConversionDaily(models.Model):
    date = models.DateField()
    campaign = models.ForeignKey(
        MarketingCampaign,
        on_delete=models.CASCADE,
        related_name="website_conversions",
    )
    page_views = models.IntegerField(default=0)
    leads_collected = models.IntegerField(default=0)
    add_to_cart = models.IntegerField(default=0)
    checkouts_initiated = models.IntegerField(default=0)
    purchases = models.IntegerField(default=0)
    purchase_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    @property
    def conversion_rate(self) -> float:
        if self.page_views == 0:
            return 0.0
        return round((self.purchases / self.page_views) * 100.0, 2)

    @property
    def aov(self) -> float:
        if self.purchases == 0:
            return 0.0
        return round(float(self.purchase_value) / self.purchases, 2)

    def __str__(self):
        return f"{self.campaign_id} - {self.date}"
