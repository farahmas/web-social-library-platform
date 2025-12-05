# books/urls.py
from django.urls import path
from .views import (
    BookListView,
    BookDetailView,
    BookSearchView,
    GoogleBooksSearchView,
    GoogleBookImportView,
    BookRatingStatsView,
    PopularBooksView,
)

urlpatterns = [
    path("popular-local/", PopularBooksView.as_view(), name="popular-books"),
    path("search/local/", BookSearchView.as_view(), name="book-search-local"),
    path("google/search/", GoogleBooksSearchView.as_view(), name="google-books-search"),
    path("google/import/", GoogleBookImportView.as_view(), name="google-book-import"),

    path("<str:pk>/rating-stats/", BookRatingStatsView.as_view(), name="book-rating-stats"),

    path("", BookListView.as_view(), name="book-list"),
    path("<str:pk>/", BookDetailView.as_view(), name="book-detail"),
]
