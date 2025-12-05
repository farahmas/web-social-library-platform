from django.urls import path
from .views import *

urlpatterns = [
    path('book/', BookLibraryStatusView.as_view()),
    path('film/', FilmLibraryStatusView.as_view()),
    path('stats/<int:user_id>/', LibraryStatsView.as_view()),
    path('book/<int:pk>/', BookLibraryStatusDetailView.as_view()),
    path('film/<int:pk>/', FilmLibraryStatusDetailView.as_view()),

]

