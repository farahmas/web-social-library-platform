from books.models import Book
from films.models import Film
from django.db.models import Avg, Count

def get_popular_books():
    return Book.objects.annotate(
        avg_rating=Avg("bookrating__score"),
        rating_count=Count("bookrating"),
        review_count=Count("bookreview")
    ).order_by("-rating_count", "-review_count")[:20]


def get_popular_films():
    return Film.objects.annotate(
        avg_rating=Avg("filmrating__score"),
        rating_count=Count("filmrating"),
        review_count=Count("filmreview")
    ).order_by("-rating_count", "-review_count")[:20]
