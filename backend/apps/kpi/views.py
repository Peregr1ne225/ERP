from django.db.models import Sum
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from datetime import datetime

from .models import MarketingCampaign, AdPerformanceDaily, WebsiteConversionDaily
from .serializers import (
    MarketingCampaignSerializer,
    AdPerformanceDailySerializer,
    WebsiteConversionDailySerializer,
)


class MarketingCampaignViewSet(viewsets.ModelViewSet):
    queryset = MarketingCampaign.objects.all()
    serializer_class = MarketingCampaignSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = MarketingCampaign.objects.all()
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    @action(detail=True, methods=["get"])
    def campaign_kpis(self, request, pk=None):
        campaign = self.get_object()

        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        # Fallback to campaign's own dates if not provided in query params
        if not start_date_str and campaign.start_date:
            start_date_str = campaign.start_date.strftime("%Y-%m-%d")
        if not end_date_str and campaign.end_date:
            end_date_str = campaign.end_date.strftime("%Y-%m-%d")

        if not start_date_str or not end_date_str:
            raise ValidationError(
                {
                    "detail": "start_date and end_date are required (either as query params or defined on campaign). Format: YYYY-MM-DD"
                }
            )

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError({"detail": "Invalid date format. Use YYYY-MM-DD."})

        # Aggregate Ad Performance
        ad_agg = AdPerformanceDaily.objects.filter(
            campaign=campaign, date__range=[start_date, end_date]
        ).aggregate(total_spend=Sum("spend"))

        # Aggregate Conversions
        conv_agg = WebsiteConversionDaily.objects.filter(
            campaign=campaign, date__range=[start_date, end_date]
        ).aggregate(
            total_purchases=Sum("purchases"), total_revenue=Sum("purchase_value")
        )

        total_spend = ad_agg["total_spend"] or 0.00
        total_purchases = conv_agg["total_purchases"] or 0
        total_revenue = conv_agg["total_revenue"] or 0.00

        # Calculate advanced KPIs
        cpa = 0.00
        if total_purchases > 0:
            cpa = round(float(total_spend) / total_purchases, 2)

        roas = 0.00
        if total_spend > 0:
            roas = round(float(total_revenue) / float(total_spend), 2)

        return Response(
            {
                "campaign_id": campaign.campaign_id,
                "campaign_name": campaign.campaign_name,
                "start_date": start_date_str,
                "end_date": end_date_str,
                "total_spend": float(total_spend),
                "total_purchases": total_purchases,
                "total_revenue": float(total_revenue),
                "cpa": cpa,
                "roas": roas,
            }
        )


class AdPerformanceDailyViewSet(viewsets.ModelViewSet):
    queryset = AdPerformanceDaily.objects.all()
    serializer_class = AdPerformanceDailySerializer
    permission_classes = [permissions.AllowAny]


class WebsiteConversionDailyViewSet(viewsets.ModelViewSet):
    queryset = WebsiteConversionDaily.objects.all()
    serializer_class = WebsiteConversionDailySerializer
    permission_classes = [permissions.AllowAny]
