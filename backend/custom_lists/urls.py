from django.urls import path
from .views import (
    CustomListView,
    CustomListItemView,
    CustomListDetailView,
    CustomListItemDetailView,
)

urlpatterns = [
    path("", CustomListView.as_view()),
    path("items/", CustomListItemView.as_view()),
    path("<int:pk>/", CustomListDetailView.as_view()),
    path("items/<int:pk>/", CustomListItemDetailView.as_view()),
]
