from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Product, InventoryLedger, CurrentInventory


class InventoryTests(APITestCase):
    def setUp(self):
        # Create user and authenticate
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client.force_authenticate(user=self.user)

        # Create a sample product
        self.product = Product.objects.create(
            sku_id="TS001-RED-M",
            ref="REF-001",
            product_name="Red T-Shirt",
            category="T-Shirt",
            size="M",
            color="Red",
        )

        # Define URLs for endpoints we'll test
        self.product_url = reverse("product-list")
        self.ledger_url = reverse("inventoryledger-list")
        self.current_inventory_url = reverse("currentinventory-list")

    def test_product_creation(self):
        """Test creating a new product via API"""
        data = {
            "sku_id": "TS002-BLU-L",
            "ref": "REF-002",
            "product_name": "Blue T-Shirt",
            "category": "T-Shirt",
            "size": "L",
            "color": "Blue",
        }
        response = self.client.post(self.product_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

    def test_inventory_signal(self):
        """Test that CurrentInventory is automatically updated when an InventoryLedger is created"""
        # Initially, there should be no CurrentInventory for the product since no ledger entry exists
        self.assertEqual(CurrentInventory.objects.filter(sku=self.product).count(), 0)

        # Create a manual IN ledger entry (+10 stock)
        ledger_in_data = {
            "sku": self.product.sku_id,
            "movement_type": "MANUAL_IN",
            "qty_change": 10,
            "note": "Initial stock",
        }
        response = self.client.post(self.ledger_url, ledger_in_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # The signal should have created a CurrentInventory entry with current_stock = 10
        current_inv = CurrentInventory.objects.get(sku=self.product)
        self.assertEqual(current_inv.current_stock, 10)

        # Create a manual OUT ledger entry (-3 stock)
        ledger_out_data = {
            "sku": self.product.sku_id,
            "movement_type": "MANUAL_OUT",
            "qty_change": -3,
            "note": "Sold 3 items",
        }
        response = self.client.post(self.ledger_url, ledger_out_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # The signal should have updated the CurrentInventory entry to current_stock = 7 (10 - 3)
        current_inv.refresh_from_db()
        self.assertEqual(current_inv.current_stock, 7)

    def test_current_inventory_read_only(self):
        """Test that current_stock cannot be manually modified via the API"""
        # First trigger the signal to create the inventory
        InventoryLedger.objects.create(
            sku=self.product, movement_type="MANUAL_IN", qty_change=5
        )

        current_inv = CurrentInventory.objects.get(sku=self.product)
        self.assertEqual(current_inv.current_stock, 5)

        # Attempt to patch the current inventory directly
        detail_url = reverse("currentinventory-detail", args=[current_inv.pk])
        patch_data = {"current_stock": 999}

        response = self.client.patch(detail_url, patch_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the stock was NOT updated to 999 because it's read_only=True
        current_inv.refresh_from_db()
        self.assertEqual(current_inv.current_stock, 5)
