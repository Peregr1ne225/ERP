from django.db import models


class DropdownList(models.Model):
    list_type = models.CharField(max_length=50)  # e.g., 'Category', 'Size', 'Color'
    list_value = models.CharField(max_length=50)  # e.g., 'T-Shirt', 'M', 'Red'

    def __str__(self):
        return f"{self.list_type} - {self.list_value}"


class Product(models.Model):
    sku_id = models.CharField(max_length=100, primary_key=True)  # e.g., 'TS001-RED-M'
    ref = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50)
    size = models.CharField(max_length=50)
    color = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.sku_id} - {self.product_name}"


class PriceHistory(models.Model):
    sku = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="price_history"
    )
    factory_cost = models.DecimalField(max_digits=10, decimal_places=2)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)
    effective_date = models.DateField()

    def __str__(self):
        return f"{self.sku_id} - {self.effective_date}"


class InventoryLedger(models.Model):
    MOVEMENT_CHOICES = [
        ("MANUAL_IN", "Manual In"),
        ("MANUAL_OUT", "Manual Out"),
        ("DAMAGED", "Damaged"),
    ]
    sku = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="ledger_entries"
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_CHOICES)
    qty_change = models.IntegerField(default=0)
    date = models.DateField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.sku_id} ({self.movement_type}): {self.qty_change}"


class CurrentInventory(models.Model):
    sku = models.OneToOneField(
        Product,
        primary_key=True,
        on_delete=models.CASCADE,
        related_name="current_inventory",
    )
    current_stock = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.sku_id}: {self.current_stock}"
