from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, QuotationViewSet, ReceiptViewSet, RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'quotations', QuotationViewSet)
router.register(r'receipts', ReceiptViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
