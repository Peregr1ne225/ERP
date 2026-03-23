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


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class PriceHistoryViewSet(viewsets.ModelViewSet):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.AllowAny]


class InventoryLedgerViewSet(viewsets.ModelViewSet):
    queryset = InventoryLedger.objects.all()
    serializer_class = InventoryLedgerSerializer
    permission_classes = [permissions.AllowAny]


class CurrentInventoryViewSet(viewsets.ModelViewSet):
    queryset = CurrentInventory.objects.all()
    serializer_class = CurrentInventorySerializer
    permission_classes = [permissions.AllowAny]
