from django.urls import path
from .views import (
    BookReviewListCreateView,
    BookReviewDetailUpdateDeleteView,
    FilmReviewListCreateView,
    FilmReviewDetailUpdateDeleteView,
)

urlpatterns = [
    path("book/<str:pk>/", BookReviewListCreateView.as_view()),
    path("book/review/<int:pk>/", BookReviewDetailUpdateDeleteView.as_view()),

    path("film/<str:pk>/", FilmReviewListCreateView.as_view()),
    path("film/review/<int:pk>/", FilmReviewDetailUpdateDeleteView.as_view()),
]
