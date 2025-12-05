from django.db import models
from django.contrib.auth.models import User
from books.models import Book
from films.models import Film

class BookLibraryStatus(models.Model):
    STATUS_CHOICES = (
        ('read', 'Read'),
        ('to_read', 'To Read'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ('user', 'book')

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"


class FilmLibraryStatus(models.Model):
    STATUS_CHOICES = (
        ('watched', 'Watched'),
        ('to_watch', 'To Watch'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    film = models.ForeignKey(Film, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ('user', 'film')

    def __str__(self):
        return f"{self.user.username} - {self.film.title} ({self.status})"
