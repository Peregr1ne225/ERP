from django.contrib import admin
from .models import (
    DropdownList,
    Product,
    PriceHistory,
    InventoryLedger,
    CurrentInventory,
)


@admin.register(DropdownList)
class DropdownListAdmin(admin.ModelAdmin):
    list_display = ("list_type", "list_value")
    search_fields = ("list_type", "list_value")
    list_filter = ("list_type",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku_id", "product_name", "category", "size", "color")
    search_fields = ("sku_id", "product_name", "ref")
    list_filter = ("category", "size", "color")


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ("sku", "factory_cost", "retail_price", "effective_date")
    search_fields = ("sku__sku_id",)
    list_filter = ("effective_date",)


@admin.register(InventoryLedger)
class InventoryLedgerAdmin(admin.ModelAdmin):
    list_display = ("sku", "movement_type", "qty_change", "date")
    search_fields = ("sku__sku_id", "note")
    list_filter = ("movement_type", "date")


@admin.register(CurrentInventory)
class CurrentInventoryAdmin(admin.ModelAdmin):
    list_display = ("sku", "current_stock")
    search_fields = ("sku__sku_id",)
    readonly_fields = (
        "current_stock",
    )  # Prevent manual editing in admin since it's signal-driven
