from django.urls import path
from .views import *
from .views import GenreListView

urlpatterns = [
    path("popular-local/", PopularFilmsView.as_view(), name="popular-films"),
    path("tmdb/search/", TMDBSearchView.as_view(), name="tmdb-search"),
    path("tmdb/trending/", TMDBTrendingView.as_view(), name="tmdb-trending"),
    path("tmdb/popular/", TMDBPopularView.as_view(), name="tmdb-popular"),
    path("import/", FilmImportView.as_view(), name="film-import"),
    path("search/local/", FilmSearchView.as_view(), name="film-search"),

    path("<str:pk>/rating-stats/", FilmRatingStatsView.as_view(), name="film-rating-stats"),
    path("genres/", GenreListView.as_view()),

    path("", FilmListView.as_view(), name="film-list"),
    path("<str:pk>/", FilmDetailView.as_view(), name="film-detail"),
]
