# books/views.py
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Avg, Count, F, ExpressionWrapper, IntegerField

from .models import Book
from .serializers import BookSerializer
from .services import google_books_search, import_book

from ratings.models import BookRating
from reviews.models import BookReview
from custom_lists.models import CustomListItem
from library.models import BookLibraryStatus


class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]


class BookDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        book = (
            Book.objects.filter(external_id=pk)
            .annotate(
                avg_rating=Avg("bookrating__score"),
                rating_count=Count("bookrating", distinct=True),
                review_count=Count("bookreview", distinct=True),
                list_count=Count("customlistitem", distinct=True),
            )
            .first()
        )

        if not book:
            return Response({"error": "Book not found"}, status=404)

        return Response(BookSerializer(book).data)


class BookRatingStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            book = Book.objects.get(external_id=pk)
        except Book.DoesNotExist:
            return Response({"average": None, "count": 0})

        stats = BookRating.objects.filter(book=book).aggregate(
            average=Avg("score"),
            count=Count("id"),
        )

        return Response(
            {
                "average": round(stats["average"], 2) if stats["average"] else None,
                "count": stats["count"],
            }
        )


class BookSearchView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        q = self.request.GET.get("q", "")
        return (
            Book.objects.filter(
                Q(title__icontains=q) | Q(authors__icontains=q)
            )
            .annotate(
                avg_rating=Avg("bookrating__score"),
                rating_count=Count("bookrating", distinct=True),
                review_count=Count("bookreview", distinct=True),
                list_count=Count("customlistitem", distinct=True),
            )
        )


class GoogleBooksSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.GET.get("q", "")
        results = google_books_search(q)

        google_ids = [b.get("google_id") for b in results if b.get("google_id")]

        if not google_ids:
            return Response(results)

        existing_books = (
            Book.objects.filter(external_id__in=google_ids)
            .annotate(
                avg_rating=Avg("bookrating__score"),
                rating_count=Count("bookrating", distinct=True),
            )
        )

        stats_map = {
            b.external_id: {
                "avg_rating": b.avg_rating,
                "rating_count": b.rating_count,
            }
            for b in existing_books
        }

        for item in results:
            gid = item.get("google_id")
            stats = stats_map.get(gid)
            if stats:
                item["avg_rating"] = stats["avg_rating"]
                item["rating_count"] = stats["rating_count"]
            else:
                item["avg_rating"] = None
                item["rating_count"] = 0

        return Response(results)

class GoogleBookImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        google_id = request.data.get("google_id")
        if not google_id:
            return Response({"error": "google_id required"}, status=400)

        book = import_book(google_id)

        book = (
            Book.objects.filter(id=book.id)
            .annotate(
                avg_rating=Avg("bookrating__score"),
                rating_count=Count("bookrating", distinct=True),
                review_count=Count("bookreview", distinct=True),
                list_count=Count("customlistitem", distinct=True),
            )
            .first()
        )

        return Response(BookSerializer(book).data)


class PopularBooksView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        books = (
            Book.objects
            .annotate(
                avg_rating=Avg("bookrating__score"),
                rating_count=Count("bookrating", distinct=True),
                review_count=Count("bookreview", distinct=True),
                list_count=Count("customlistitem", distinct=True),
            )
            .annotate(
                popularity=ExpressionWrapper(
                    F("rating_count") + F("review_count") + F("list_count"),
                    output_field=IntegerField(),
                )
            )
            .order_by("-popularity", "-avg_rating")[:20]
        )

        return Response(BookSerializer(books, many=True).data)
