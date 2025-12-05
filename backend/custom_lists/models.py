from django.db import models
from django.contrib.auth.models import User
from books.models import Book
from films.models import Film


class CustomList(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class CustomListItem(models.Model):
    CONTENT_CHOICES = (
        ("book", "Book"),
        ("film", "Film"),
    )

    custom_list = models.ForeignKey(
        CustomList,
        on_delete=models.CASCADE,
        related_name="items",
    )

    content_type = models.CharField(max_length=10, choices=CONTENT_CHOICES)

    book = models.ForeignKey(Book, on_delete=models.CASCADE, blank=True, null=True)
    film = models.ForeignKey(Film, on_delete=models.CASCADE, blank=True, null=True)

    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("custom_list", "content_type", "book", "film")

    def __str__(self):
        if self.content_type == "book" and self.book:
            return f"{self.custom_list.name} -> {self.book.title}"
        if self.content_type == "film" and self.film:
            return f"{self.custom_list.name} -> {self.film.title}"
        return f"{self.custom_list.name} item"
