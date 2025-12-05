from django.urls import path
from .views import *

urlpatterns = [
    path('<int:pk>/', UserDetailView.as_view()),
    path('me/update/', UserProfileUpdateView.as_view()),

]
