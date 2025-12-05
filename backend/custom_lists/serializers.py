# custom_lists/serializers.py
from rest_framework import serializers
from .models import CustomList, CustomListItem


class CustomListItemSerializer(serializers.ModelSerializer):
    book_external_id = serializers.CharField(
        source="book.external_id", read_only=True
    )
    book_title = serializers.CharField(
        source="book.title", read_only=True
    )
    book_cover = serializers.CharField(
        source="book.cover_url", read_only=True
    )

    film_external_id = serializers.CharField(
        source="film.external_id", read_only=True
    )
    film_title = serializers.CharField(
        source="film.title", read_only=True
    )
    film_poster = serializers.CharField(
        source="film.poster_url", read_only=True
    )

    class Meta:
        model = CustomListItem
        fields = [
            "id",
            "custom_list",
            "content_type",
            "book",
            "film",
            "added_at",
            "book_external_id",
            "book_title",
            "book_cover",
            "film_external_id",
            "film_title",
            "film_poster",
        ]


class CustomListSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    items = CustomListItemSerializer(many=True, read_only=True)

    class Meta:
        model = CustomList
        fields = [
            "id",
            "user",
            "name",
            "description",
            "created_at",
            "items",
        ]
        read_only_fields = ["user", "created_at", "items"]
