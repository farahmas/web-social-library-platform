from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    avg_rating = serializers.FloatField(read_only=True)
    rating_count = serializers.IntegerField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    list_count = serializers.IntegerField(read_only=True)
    popularity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = "__all__"
