from django.db.models import Avg, Count
from .models import BookRating, FilmRating
from books.models import Book

def get_book_rating_stats(external_id):
    try:
        book = Book.objects.get(external_id=external_id)
    except Book.DoesNotExist:
        return {"average": None, "count": 0}

    stats = BookRating.objects.filter(book=book).aggregate(
        avg=Avg("score"),
        count=Count("id")
    )

    return {
        "average": round(stats["avg"], 2) if stats["avg"] else None,
        "count": stats["count"]
    }


def get_film_rating_stats(film_id):
    stats = FilmRating.objects.filter(film_id=film_id).aggregate(
        avg=Avg('score'),
        count=Count('id')
    )
    return {
        "average": round(stats["avg"], 2) if stats["avg"] else None,
        "count": stats["count"]
    }
