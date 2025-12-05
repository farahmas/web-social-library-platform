from rest_framework import serializers
from .models import BookRating, FilmRating
from users.serializers import UserSerializer


class BookRatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    def validate_score(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Score must be between 1 and 10.")
        return value

    class Meta:
        model = BookRating
        fields = ["id", "user", "book", "score", "created_at"]
        read_only_fields = ["user", "created_at"]


class FilmRatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    def validate_score(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Score must be between 1 and 10.")
        return value

    class Meta:
        model = FilmRating
        fields = ["id", "user", "film", "score", "created_at"]
        read_only_fields = ["user", "created_at"]
