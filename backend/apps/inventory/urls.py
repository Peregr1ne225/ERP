from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DropdownListViewSet,
    ProductViewSet,
    PriceHistoryViewSet,
    InventoryLedgerViewSet,
    CurrentInventoryViewSet,
)

router = DefaultRouter()
router.register(r"dropdowns", DropdownListViewSet)
router.register(r"products", ProductViewSet)
router.register(r"price-history", PriceHistoryViewSet)
router.register(r"inventory-ledger", InventoryLedgerViewSet)
router.register(r"current-inventory", CurrentInventoryViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
