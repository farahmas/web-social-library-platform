# activity/serializers.py
from rest_framework import serializers
from django.utils.timesince import timesince

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    action = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()

    # NEW: likes
    like_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            "id",
            "user",
            "action",
            "content",
            "timestamp",
            "like_count",
            "liked_by_me",
        ]

    def get_user(self, obj):
        profile = getattr(obj.user, "profile", None)
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "avatar": profile.avatar if profile else None,
        }

    def get_action(self, obj):
        mapping = {
            "rate_book": "bir kitabı oyladı.",
            "rate_film": "bir filmi oyladı.",
            "review_book": "bir kitap hakkında yorum yaptı.",
            "review_film": "bir film hakkında yorum yaptı.",
            "library_update": "kütüphanesini güncelledi.",
            "custom_list_add": "özel listesine içerik ekledi.",
        }
        return mapping.get(obj.activity_type, "bir şeyler yaptı.")

    def get_content(self, obj):
        if obj.book:
            book = obj.book
            return {
                "type": "book",
                "id": book.external_id,  
                "db_id": book.id, 
                "title": book.title,
                "poster": book.cover_url,
                "rating": obj.rating_book.score if obj.rating_book else None,
                "review_excerpt": (
                    obj.review_book.text[:180] + "..."
                    if obj.review_book and obj.review_book.text
                    else None
                ),
            }

        if obj.film:
            film = obj.film
            return {
                "type": "film",
                "id": film.external_id,  
                "db_id": film.id,
                "title": film.title,
                "poster": film.poster_url,
                "rating": obj.rating_film.score if obj.rating_film else None,
                "review_excerpt": (
                    obj.review_film.text[:180] + "..."
                    if obj.review_film and obj.review_film.text
                    else None
                ),
            }

        return None

    def get_timestamp(self, obj):
        return timesince(obj.created_at) + " ago"

    def get_liked_by_me(self, obj):
        """
        ActivityFeedView annotate'inde liked_by_me integer olarak gelir.
        >0 ise True sayıyoruz.
        """
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        if hasattr(obj, "liked_by_me"):
            return bool(obj.liked_by_me)

        return obj.likes.filter(user=request.user).exists()
