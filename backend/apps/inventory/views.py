from rest_framework import viewsets
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


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class PriceHistoryViewSet(viewsets.ModelViewSet):
    queryset = PriceHistory.objects.all()
    serializer_class = PriceHistorySerializer


class InventoryLedgerViewSet(viewsets.ModelViewSet):
    queryset = InventoryLedger.objects.all()
    serializer_class = InventoryLedgerSerializer


class CurrentInventoryViewSet(viewsets.ModelViewSet):
    queryset = CurrentInventory.objects.all()
    serializer_class = CurrentInventorySerializer
