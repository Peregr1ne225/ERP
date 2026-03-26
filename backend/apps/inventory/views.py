from rest_framework import viewsets, permissions
from .models import (
    DropdownList,
    Product,
    PriceHistory,
    InventoryLedger,
    CurrentInventory,
)
from .serializers import (
    DropdownListSerializer,
    ProductSerializer,
    PriceHistorySerializer,
    InventoryLedgerSerializer,
    CurrentInventorySerializer,
)


class DropdownListViewSet(viewsets.ModelViewSet):
    queryset = DropdownList.objects.all()
    serializer_class = DropdownListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["list_type"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["category"]
    search_fields = ["sku_id", "product_name", "ref"]


class PriceHistoryViewSet(viewsets.ModelViewSet):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["sku"]


class InventoryLedgerViewSet(viewsets.ModelViewSet):
    queryset = InventoryLedger.objects.all()
    serializer_class = InventoryLedgerSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["sku"]


class CurrentInventoryViewSet(viewsets.ModelViewSet):
    queryset = CurrentInventory.objects.all()
    serializer_class = CurrentInventorySerializer
    permission_classes = [permissions.AllowAny]
