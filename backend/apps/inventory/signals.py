from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from .models import InventoryLedger, CurrentInventory


@receiver(post_save, sender=InventoryLedger)
def update_current_inventory(sender, instance, created, **kwargs):
    # Calculate the total stock by summing all qty_change for the given sku
    total_qty = (
        InventoryLedger.objects.filter(sku=instance.sku).aggregate(
            total=Sum("qty_change")
        )["total"]
        or 0
    )

    # Automatically update or create the CurrentInventory record
    CurrentInventory.objects.update_or_create(
        sku=instance.sku, defaults={"current_stock": total_qty}
    )
