from rest_framework import serializers
from .models import Client, Quotation, QuotationItem, Receipt, ReceiptItem


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone', 'address', 'company', 'created_at', 'updated_at']


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id', 'quotation_number', 'client', 'client_name', 'client_email',
            'date', 'valid_until', 'status', 'terms', 'subtotal', 'tax',
            'total', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['quotation_number']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        quotation = Quotation.objects.create(**validated_data)
        
        # Calculate totals
        subtotal = 0
        for item_data in items_data:
            item = QuotationItem.objects.create(quotation=quotation, **item_data)
            subtotal += item.total
        
        quotation.subtotal = subtotal
        quotation.total = subtotal + quotation.tax
        quotation.save()
        
        return quotation

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update quotation fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            subtotal = 0
            for item_data in items_data:
                item = QuotationItem.objects.create(quotation=instance, **item_data)
                subtotal += item.total
            
            instance.subtotal = subtotal
            instance.total = subtotal + instance.tax
        
        instance.save()
        return instance


class ReceiptItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReceiptItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'total']
        read_only_fields = ['total']


class ReceiptSerializer(serializers.ModelSerializer):
    items = ReceiptItemSerializer(many=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id', 'receipt_number', 'client', 'client_name', 'client_email',
            'date', 'payment_method', 'status', 'subtotal', 'tax',
            'total', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['receipt_number']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        receipt = Receipt.objects.create(**validated_data)
        
        # Calculate totals
        subtotal = 0
        for item_data in items_data:
            item = ReceiptItem.objects.create(receipt=receipt, **item_data)
            subtotal += item.total
        
        receipt.subtotal = subtotal
        receipt.total = subtotal + receipt.tax
        receipt.save()
        
        return receipt

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update receipt fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            
            # Create new items
            subtotal = 0
            for item_data in items_data:
                item = ReceiptItem.objects.create(receipt=instance, **item_data)
                subtotal += item.total
            
            instance.subtotal = subtotal
            instance.total = subtotal + instance.tax
        
        instance.save()
        return instance
