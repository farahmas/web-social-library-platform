# activity/urls.py
from django.urls import path
from .views import ActivityFeedView, ActivityLikeToggleView

urlpatterns = [
    path("", ActivityFeedView.as_view(), name="activity-feed"),
    path("<int:pk>/like/", ActivityLikeToggleView.as_view(), name="activity-like-toggle"),
]
