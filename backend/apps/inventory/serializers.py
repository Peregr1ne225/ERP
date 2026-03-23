from rest_framework import serializers
from .models import (
    DropdownList,
    Product,
    PriceHistory,
    InventoryLedger,
    CurrentInventory,
)


class DropdownListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DropdownList
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = "__all__"


class InventoryLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLedger
        fields = "__all__"


class CurrentInventorySerializer(serializers.ModelSerializer):
    current_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = CurrentInventory
        fields = "__all__"
