# social/urls.py
from django.urls import path
from .views import FollowView, FollowDetailView

urlpatterns = [
    path("", FollowView.as_view()),           
    path("<int:pk>/", FollowDetailView.as_view()),  
]
