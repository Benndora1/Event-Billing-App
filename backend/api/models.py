from django.db import models
from django.utils import timezone
import uuid


class Client(models.Model):
    """Client model for storing customer information"""
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50)
    address = models.TextField(blank=True)
    company = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Quotation(models.Model):
    """Quotation model for managing event quotations"""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]

    quotation_number = models.CharField(max_length=50, unique=True, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='quotations')
    date = models.DateField(default=timezone.now)
    valid_until = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    terms = models.TextField(default='Payment is due within 30 days')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quotation_number} - {self.client.name}"

    def save(self, *args, **kwargs):
        if not self.quotation_number:
            # Generate unique quotation number
            last_quotation = Quotation.objects.order_by('-id').first()
            if last_quotation:
                last_num = int(last_quotation.quotation_number.split('-')[1])
                new_num = last_num + 1
            else:
                new_num = 1
            self.quotation_number = f'QT-{new_num:05d}'
        super().save(*args, **kwargs)


class QuotationItem(models.Model):
    """Line items for quotations"""
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=500)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} - {self.quotation.quotation_number}"


class Receipt(models.Model):
    """Receipt model for managing payments"""
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('CANCELLED', 'Cancelled'),
    ]

    PAYMENT_METHODS = [
        ('CASH', 'Cash'),
        ('CARD', 'Credit/Debit Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CHECK', 'Check'),
    ]

    receipt_number = models.CharField(max_length=50, unique=True, editable=False)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='receipts')
    date = models.DateTimeField(default=timezone.now)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PAID')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.receipt_number} - {self.client.name}"

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            # Generate unique receipt number
            last_receipt = Receipt.objects.order_by('-id').first()
            if last_receipt:
                last_num = int(last_receipt.receipt_number.split('-')[1])
                new_num = last_num + 1
            else:
                new_num = 1
            self.receipt_number = f'RC-{new_num:05d}'
        super().save(*args, **kwargs)


class ReceiptItem(models.Model):
    """Line items for receipts"""
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name='items')
    description = models.CharField(max_length=500)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} - {self.receipt.receipt_number}"
