from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    MeView,
    LoginView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path('register/', RegisterView.as_view()),             
    path('login/', LoginView.as_view()),                    
    path('refresh/', TokenRefreshView.as_view()),           
    path('me/', MeView.as_view()),                          

    path('password-reset/', PasswordResetRequestView.as_view()),          
    path('password-reset-confirm/', PasswordResetConfirmView.as_view()),  
]
