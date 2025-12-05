# activity/models.py
from django.db import models
from django.contrib.auth.models import User
from books.models import Book
from films.models import Film
from ratings.models import BookRating, FilmRating
from reviews.models import BookReview, FilmReview


class Activity(models.Model):
    ACTIVITY_TYPES = (
        ("rate_book", "Rate Book"),
        ("rate_film", "Rate Film"),
        ("review_book", "Review Book"),
        ("review_film", "Review Film"),
        ("library_update", "Library Update"),
        ("custom_list_add", "Custom List Add"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)

    book = models.ForeignKey(Book, on_delete=models.CASCADE, blank=True, null=True)
    film = models.ForeignKey(Film, on_delete=models.CASCADE, blank=True, null=True)

    rating_book = models.ForeignKey(
        BookRating, on_delete=models.CASCADE, blank=True, null=True
    )
    rating_film = models.ForeignKey(
        FilmRating, on_delete=models.CASCADE, blank=True, null=True
    )

    review_book = models.ForeignKey(
        BookReview, on_delete=models.CASCADE, blank=True, null=True
    )
    review_film = models.ForeignKey(
        FilmReview, on_delete=models.CASCADE, blank=True, null=True
    )

    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.activity_type}"


class ActivityLike(models.Model):
    """
    Bir kullanıcının bir activity'yi beğenmesi.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="activity_likes",
    )
    activity = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "activity")

    def __str__(self):
        return f"{self.user} ♥ {self.activity_id}"
