from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Avg, Count

from .models import Film
from .serializers import FilmSerializer
from .services import tmdb_search, tmdb_trending, tmdb_popular, import_film

from ratings.models import FilmRating
from reviews.models import FilmReview
from custom_lists.models import CustomListItem
from library.models import FilmLibraryStatus
from rest_framework import permissions

from .models import Film
from books.models import Book

class FilmListView(generics.ListAPIView):
    queryset = Film.objects.all()
    serializer_class = FilmSerializer
    permission_classes = [permissions.AllowAny]


class FilmDetailView(APIView):
    def get(self, request, pk):
        film_qs = (
            Film.objects
            .filter(external_id=pk)
            .annotate(
                avg_rating=Avg("filmrating__score"),
                rating_count=Count("filmrating"),
                review_count=Count("filmreview"),
            )
        )

        film = film_qs.first()

        if not film:
            try:
                db_film = Film.objects.get(id=pk)
            except Film.DoesNotExist:
                return Response({"error": "Film not found"}, status=404)

            film = (
                Film.objects
                .filter(id=db_film.id)
                .annotate(
                    avg_rating=Avg("filmrating__score"),
                    rating_count=Count("filmrating"),
                    review_count=Count("filmreview"),
                )
                .first()
            )

        return Response(FilmSerializer(film).data)


class FilmSearchView(generics.ListAPIView):
    serializer_class = FilmSerializer

    def get_queryset(self):
        q = self.request.GET.get("q", "")
        return (
            Film.objects
            .filter(Q(title__icontains=q) | Q(genres__icontains=q))
            .annotate(
                avg_rating=Avg("filmrating__score"),
                rating_count=Count("filmrating"),
                review_count=Count("filmreview")
            )
        )


class FilmImportView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request):
        tmdb_id = request.data.get("tmdb_id")
        if not tmdb_id:
            return Response({"error": "tmdb_id required"}, status=400)

        try:
            film = import_film(tmdb_id)
        except Exception as exc:
            print("TMDB import error:", exc)
            return Response(
                {"error": "TMDB import failed"},
                status=500,
            )

        film_with_stats = (
            Film.objects.filter(id=film.id)
            .annotate(
                avg_rating=Avg("filmrating__score"),
                rating_count=Count("filmrating", distinct=True),
                review_count=Count("filmreview", distinct=True),
            )
            .first()
        )

        return Response(FilmSerializer(film_with_stats).data)


class TMDBSearchView(APIView):
    def get(self, request):
        q = request.GET.get("q", "")
        return Response(tmdb_search(q))


class TMDBTrendingView(APIView):
    def get(self, request):
        return Response(tmdb_trending())


class TMDBPopularView(APIView):
    def get(self, request):
        return Response(tmdb_popular())


class FilmRatingStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        qs = Film.objects.filter(external_id=str(pk))

        if not qs.exists():
            return Response({"average": None, "count": 0})

        stats = FilmRating.objects.filter(film__in=qs).aggregate(
            average=Avg("score"),
            count=Count("id"),
        )

        average = stats.get("average")
        count = stats.get("count") or 0

        return Response(
            {
                "average": round(average, 2) if average is not None else None,
                "count": count,
            }
        )


from django.db.models import Count, F, ExpressionWrapper, IntegerField, Q, Avg

class PopularFilmsView(APIView):
    def get(self, request):
        films = (
            Film.objects
            .annotate(
                avg_rating=Avg("filmrating__score"),
                rating_count=Count("filmrating", distinct=True),
                review_count=Count("filmreview", distinct=True),
                list_count=Count(
                    "customlistitem",
                    filter=Q(customlistitem__content_type="film"),
                    distinct=True,
                ),
            )
            .annotate(
                popularity=ExpressionWrapper(
                    F("review_count") + F("rating_count") + F("list_count"),
                    output_field=IntegerField(),
                )
            )
            .order_by("-popularity", "-avg_rating")[:20]
        )

        return Response(FilmSerializer(films, many=True).data)

class GenreListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        film_genres = Film.objects.values_list("genres", flat=True)

        all_genres = set()

        for g in film_genres:
            if not g:
                continue
            for part in g.split(","):
                name = part.strip()
                if name:
                    all_genres.add(name)

        return Response(sorted(all_genres))