from rest_framework import serializers
from .models import MarketingCampaign, AdPerformanceDaily, WebsiteConversionDaily


class MarketingCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingCampaign
        fields = "__all__"


class AdPerformanceDailySerializer(serializers.ModelSerializer):
    ctr = serializers.FloatField(read_only=True)
    cpc = serializers.FloatField(read_only=True)

    class Meta:
        model = AdPerformanceDaily
        fields = "__all__"


class WebsiteConversionDailySerializer(serializers.ModelSerializer):
    conversion_rate = serializers.FloatField(read_only=True)
    aov = serializers.FloatField(read_only=True)

    class Meta:
        model = WebsiteConversionDaily
        fields = "__all__"
