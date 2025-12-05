from django.urls import path
from .views import *

urlpatterns = [
    path('book/', BookRatingCreateUpdateView.as_view()),
    path('film/', FilmRatingCreateUpdateView.as_view()),
    path('book/<str:pk>/', BookRatingDetailView.as_view()),
    path('film/<str:pk>/', FilmRatingDetailView.as_view()),

]
