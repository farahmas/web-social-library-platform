from books.models import Book
from films.models import Film
from library.models import BookLibraryStatus, FilmLibraryStatus
from ratings.models import BookRating, FilmRating
from reviews.models import BookReview, FilmReview
from activity.models import Activity

def get_user_library_stats(user_id):

    books_read = BookLibraryStatus.objects.filter(user_id=user_id, status='read').count()
    books_to_read = BookLibraryStatus.objects.filter(user_id=user_id, status='to_read').count()

    films_watched = FilmLibraryStatus.objects.filter(user_id=user_id, status='watched').count()
    films_to_watch = FilmLibraryStatus.objects.filter(user_id=user_id, status='to_watch').count()

    total_ratings = BookRating.objects.filter(user_id=user_id).count() + \
                    FilmRating.objects.filter(user_id=user_id).count()

    total_reviews = BookReview.objects.filter(user_id=user_id).count() + \
                    FilmReview.objects.filter(user_id=user_id).count()

    last_activity_obj = Activity.objects.filter(user_id=user_id).order_by('-created_at').first()
    last_activity = last_activity_obj.created_at if last_activity_obj else None

    return {
        "books_read": books_read,
        "books_to_read": books_to_read,
        "films_watched": films_watched,
        "films_to_watch": films_to_watch,
        "total_ratings": total_ratings,
        "total_reviews": total_reviews,
        "last_activity": last_activity,
    }
