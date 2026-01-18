from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from .pdf_generator import generate_quotation_pdf, generate_receipt_pdf
import os


def send_quotation_email(quotation):
    """Send quotation email with PDF attachment"""
    
    # Generate PDF
    pdf_path = generate_quotation_pdf(quotation)
    
    # Prepare email content
    subject = f'Quotation {quotation.quotation_number} from Event Company'
    
    html_message = f"""
    <html>
    <body>
        <h2>Quotation {quotation.quotation_number}</h2>
        <p>Dear {quotation.client.name},</p>
        <p>Thank you for your interest in our event services. Please find attached your quotation.</p>
        
        <h3>Quotation Details:</h3>
        <ul>
            <li><strong>Quotation Number:</strong> {quotation.quotation_number}</li>
            <li><strong>Date:</strong> {quotation.date}</li>
            <li><strong>Valid Until:</strong> {quotation.valid_until}</li>
            <li><strong>Total Amount:</strong> ${quotation.total:.2f}</li>
        </ul>
        
        <p>Please review the attached quotation and let us know if you have any questions.</p>
        
        <p>Best regards,<br>
        Event Company Team</p>
    </body>
    </html>
    """
    
    # Create email
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@eventcompany.com'),
        to=[quotation.client.email],
    )
    
    # Attach PDF
    email.attach_file(pdf_path)
    email.content_subtype = 'html'
    
    # Send email
    email.send()
    
    # Clean up PDF file
    if os.path.exists(pdf_path):
        os.remove(pdf_path)


def send_receipt_email(receipt):
    """Send receipt email with PDF attachment"""
    
    # Generate PDF
    pdf_path = generate_receipt_pdf(receipt)
    
    # Prepare email content
    subject = f'Receipt {receipt.receipt_number} from Event Company'
    
    html_message = f"""
    <html>
    <body>
        <h2>Receipt {receipt.receipt_number}</h2>
        <p>Dear {receipt.client.name},</p>
        <p>Thank you for your payment. Please find attached your receipt.</p>
        
        <h3>Receipt Details:</h3>
        <ul>
            <li><strong>Receipt Number:</strong> {receipt.receipt_number}</li>
            <li><strong>Date:</strong> {receipt.date}</li>
            <li><strong>Payment Method:</strong> {receipt.get_payment_method_display()}</li>
            <li><strong>Total Amount:</strong> ${receipt.total:.2f}</li>
        </ul>
        
        <p>Please keep this receipt for your records.</p>
        
        <p>Best regards,<br>
        Event Company Team</p>
    </body>
    </html>
    """
    
    # Create email
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@eventcompany.com'),
        to=[receipt.client.email],
    )
    
    # Attach PDF
    email.attach_file(pdf_path)
    email.content_subtype = 'html'
    
    # Send email
    email.send()
    
    # Clean up PDF file
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
