from rest_framework import serializers
from .models import BookReview, FilmReview
from users.serializers import UserSerializer


class BookReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BookReview
        fields = ["id", "user", "book", "text", "created_at"]
        read_only_fields = ["user", "created_at"]


class FilmReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FilmReview
        fields = ["id", "user", "film", "text", "created_at"]
        read_only_fields = ["user", "created_at"]
