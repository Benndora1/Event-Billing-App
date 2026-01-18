from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Client, Quotation, Receipt
from .serializers import ClientSerializer, QuotationSerializer, ReceiptSerializer


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    """
    User registration endpoint
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        email = request.data.get('email', '').strip()

        errors = []

        if not username:
            errors.append('Username is required')
        elif User.objects.filter(username__iexact=username).exists():
            errors.append('Username already exists')

        if not password:
            errors.append('Password is required')
        elif len(password) < 8:
            errors.append('Password must be at least 8 characters')

        if email and User.objects.filter(email__iexact=email).exists():
            errors.append('Email already registered')

        if errors:
            return Response(
                {'error': 'Registration failed', 'details': errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        return Response(
            {
                'message': 'User created successfully',
                'user_id': user.id,
                'username': user.username,
            },
            status=status.HTTP_201_CREATED
        )


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        from .utils.email_service import send_quotation_email
        quotation = self.get_object()
        send_quotation_email(quotation)
        return Response({'message': 'Quotation sent successfully'})


class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all()
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        from .utils.email_service import send_receipt_email
        receipt = self.get_object()
        send_receipt_email(receipt)
        return Response({'message': 'Receipt sent successfully'})
