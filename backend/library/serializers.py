from rest_framework import serializers
from .models import BookLibraryStatus, FilmLibraryStatus


class BookLibraryStatusSerializer(serializers.ModelSerializer):
    book_external_id = serializers.CharField(source="book.external_id", read_only=True)
    book_title = serializers.CharField(source="book.title", read_only=True)
    book_cover = serializers.CharField(source="book.cover_url", read_only=True)

    class Meta:
        model = BookLibraryStatus
        fields = [
            "id", "user", "book", 
            "book_external_id", "book_title", "book_cover",
            "status"
        ]


class FilmLibraryStatusSerializer(serializers.ModelSerializer):
    film_external_id = serializers.CharField(source="film.external_id", read_only=True)
    film_title = serializers.CharField(source="film.title", read_only=True)
    film_poster = serializers.CharField(source="film.poster_url", read_only=True)

    class Meta:
        model = FilmLibraryStatus
        fields = [
            "id", "user", "film",
            "film_external_id", "film_title", "film_poster",
            "status"
        ]
