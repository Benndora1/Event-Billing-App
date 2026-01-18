import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.conf import settings


def _ensure_media_dir():
    media_root = os.path.join(settings.BASE_DIR, 'media')
    os.makedirs(media_root, exist_ok=True)
    return media_root


def generate_quotation_pdf(quotation):
    """Generate a PDF file for a quotation and return the file path."""
    media_root = _ensure_media_dir()
    filename = f'quotation_{quotation.id}.pdf'
    filepath = os.path.join(media_root, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    # Header
    c.setFont('Helvetica-Bold', 20)
    c.drawString(50, height - 50, f'Quotation #{quotation.quotation_number}')
    # Client info
    c.setFont('Helvetica', 12)
    c.drawString(50, height - 80, f'Client: {quotation.client.name}')
    c.drawString(50, height - 100, f'Email: {quotation.client.email}')
    c.drawString(50, height - 120, f'Date: {quotation.date}')
    c.drawString(50, height - 140, f'Valid Until: {quotation.valid_until}')
    # Table header
    y = height - 180
    c.setFont('Helvetica-Bold', 12)
    c.drawString(50, y, 'Description')
    c.drawString(300, y, 'Qty')
    c.drawString(350, y, 'Unit Price')
    c.drawString(450, y, 'Total')
    # Items
    c.setFont('Helvetica', 12)
    y -= 20
    for item in quotation.items.all():
        c.drawString(50, y, item.description)
        c.drawString(300, y, str(item.quantity))
        c.drawString(350, y, f'${item.unit_price:.2f}')
        c.drawString(450, y, f'${item.total:.2f}')
        y -= 20
        if y < 100:
            c.showPage()
            y = height - 50
    # Totals
    c.setFont('Helvetica-Bold', 12)
    c.drawString(350, y - 10, 'Subtotal:')
    c.drawString(450, y - 10, f'${quotation.subtotal:.2f}')
    c.drawString(350, y - 30, 'Tax:')
    c.drawString(450, y - 30, f'${quotation.tax:.2f}')
    c.drawString(350, y - 50, 'Total:')
    c.drawString(450, y - 50, f'${quotation.total:.2f}')
    c.save()
    return filepath


def generate_receipt_pdf(receipt):
    """Generate a PDF file for a receipt and return the file path."""
    media_root = _ensure_media_dir()
    filename = f'receipt_{receipt.id}.pdf'
    filepath = os.path.join(media_root, filename)
    c = canvas.Canvas(filepath, pagesize=A4)
    width, height = A4
    # Header
    c.setFont('Helvetica-Bold', 20)
    c.drawString(50, height - 50, f'Receipt #{receipt.receipt_number}')
    # Client info
    c.setFont('Helvetica', 12)
    c.drawString(50, height - 80, f'Client: {receipt.client.name}')
    c.drawString(50, height - 100, f'Email: {receipt.client.email}')
    c.drawString(50, height - 120, f'Date: {receipt.date}')
    c.drawString(50, height - 140, f'Payment Method: {receipt.get_payment_method_display()}')
    # Table header
    y = height - 180
    c.setFont('Helvetica-Bold', 12)
    c.drawString(50, y, 'Description')
    c.drawString(300, y, 'Qty')
    c.drawString(350, y, 'Unit Price')
    c.drawString(450, y, 'Total')
    # Items
    c.setFont('Helvetica', 12)
    y -= 20
    for item in receipt.items.all():
        c.drawString(50, y, item.description)
        c.drawString(300, y, str(item.quantity))
        c.drawString(350, y, f'${item.unit_price:.2f}')
        c.drawString(450, y, f'${item.total:.2f}')
        y -= 20
        if y < 100:
            c.showPage()
            y = height - 50
    # Totals
    c.setFont('Helvetica-Bold', 12)
    c.drawString(350, y - 10, 'Subtotal:')
    c.drawString(450, y - 10, f'${receipt.subtotal:.2f}')
    c.drawString(350, y - 30, 'Tax:')
    c.drawString(450, y - 30, f'${receipt.tax:.2f}')
    c.drawString(350, y - 50, 'Total:')
    c.drawString(450, y - 50, f'${receipt.total:.2f}')
    c.save()
    return filepath
