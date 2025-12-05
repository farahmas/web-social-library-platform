# backend/ratings/views.py
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import BookRating, FilmRating
from .serializers import BookRatingSerializer, FilmRatingSerializer

from books.models import Book
from films.models import Film

class BookRatingCreateUpdateView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def post(self, request):
      book_id = request.data.get("book")  # external_id from body
      score = request.data.get("score")

      if not book_id or score is None:
          return Response({"error": "book and score required"}, status=400)

      try:
          book = Book.objects.get(external_id=book_id)
      except Book.DoesNotExist:
          return Response({"error": "Book not found"}, status=404)

      rating, created = BookRating.objects.get_or_create(
          user=request.user,
          book=book,
          defaults={"score": score},
      )

      if not created:
          rating.score = score
          rating.save()

      return Response({"score": rating.score})


class FilmRatingCreateUpdateView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def post(self, request):
      film_id = request.data.get("film")  # TMDB external_id
      score = request.data.get("score")

      if not film_id or score is None:
          return Response({"error": "film and score required"}, status=400)

      try:
          film = Film.objects.get(external_id=film_id)
      except Film.DoesNotExist:
          return Response({"error": "Film not found"}, status=404)

      rating, created = FilmRating.objects.get_or_create(
          user=request.user,
          film=film,
          defaults={"score": score},
      )

      if not created:
          rating.score = score
          rating.save()

      return Response({"score": rating.score})

class BookRatingDetailView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def _get_book(self, external_id):
      return Book.objects.get(external_id=external_id)

  def get(self, request, pk):
      try:
          book = self._get_book(pk)
      except Book.DoesNotExist:
          return Response({"score": None})

      rating = BookRating.objects.filter(book=book, user=request.user).first()
      return Response({"score": rating.score if rating else None})

  def post(self, request, pk):
      score = request.data.get("score")
      if score is None:
          return Response({"error": "score required"}, status=400)

      try:
          book = self._get_book(pk)
      except Book.DoesNotExist:
          return Response({"error": "Book not found"}, status=404)

      rating, _ = BookRating.objects.update_or_create(
          user=request.user,
          book=book,
          defaults={"score": score},
      )
      return Response({"score": rating.score})

  def delete(self, request, pk):
      try:
          book = self._get_book(pk)
      except Book.DoesNotExist:
          return Response({"error": "Book not found"}, status=404)

      rating = BookRating.objects.filter(book=book, user=request.user).first()
      if not rating:
          return Response({"error": "Rating not found"}, status=404)

      rating.delete()
      return Response(status=204)

class FilmRatingDetailView(APIView):
  permission_classes = [permissions.IsAuthenticated]

  def _get_film(self, external_id):
      return Film.objects.get(external_id=external_id)

  def get(self, request, pk):
      try:
          film = self._get_film(pk)
      except Film.DoesNotExist:
          return Response({"score": None})

      rating = FilmRating.objects.filter(film=film, user=request.user).first()
      return Response({"score": rating.score if rating else None})

  def post(self, request, pk):
      score = request.data.get("score")
      if score is None:
          return Response({"error": "score required"}, status=400)

      try:
          film = self._get_film(pk)
      except Film.DoesNotExist:
          return Response({"error": "Film not found"}, status=404)

      rating, _ = FilmRating.objects.update_or_create(
          user=request.user,
          film=film,
          defaults={"score": score},
      )
      return Response({"score": rating.score})

  def delete(self, request, pk):
      try:
          film = self._get_film(pk)
      except Film.DoesNotExist:
          return Response({"error": "Film not found"}, status=404)

      rating = FilmRating.objects.filter(film=film, user=request.user).first()
      if not rating:
          return Response({"error": "Rating not found"}, status=404)

      rating.delete()
      return Response(status=204)
