from django.contrib import admin
from .models import Client, Quotation, QuotationItem, Receipt, ReceiptItem


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1


class ReceiptItemInline(admin.TabularInline):
    model = ReceiptItem
    extra = 1


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'company', 'created_at']
    search_fields = ['name', 'email', 'company']
    list_filter = ['created_at']


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ['quotation_number', 'client', 'date', 'valid_until', 'status', 'total']
    list_filter = ['status', 'date']
    search_fields = ['quotation_number', 'client__name']
    inlines = [QuotationItemInline]


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'client', 'date', 'payment_method', 'status', 'total']
    list_filter = ['status', 'payment_method', 'date']
    search_fields = ['receipt_number', 'client__name']
    inlines = [ReceiptItemInline]
