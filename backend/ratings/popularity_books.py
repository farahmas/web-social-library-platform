from django.db.models import Avg, Count
from books.models import Book
from ratings.models import BookRating
from reviews.models import BookReview

def get_popular_books(limit=10):
    books = Book.objects.annotate(
        avg_rating=Avg("bookrating__score"),
        rating_count=Count("bookrating"),
        review_count=Count("bookreview"),
    ).order_by("-rating_count", "-review_count", "-avg_rating")

    return books[:limit]
