from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import BookReview, FilmReview
from .serializers import BookReviewSerializer, FilmReviewSerializer
from api.permissions import IsOwnerOrReadOnly

from books.models import Book
from films.models import Film


class BookReviewListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            book = Book.objects.get(external_id=pk)
        except Book.DoesNotExist:
            return Response([], status=200)

        reviews = BookReview.objects.filter(book=book).order_by("-created_at")
        return Response(BookReviewSerializer(reviews, many=True).data, status=200)

    def post(self, request, pk):
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"error": "text required"}, status=400)

        try:
            book = Book.objects.get(external_id=pk)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)

        review = BookReview.objects.create(
            user=request.user,
            book=book,
            text=text,
        )
        return Response(BookReviewSerializer(review).data, status=201)


class FilmReviewListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            film = Film.objects.get(external_id=pk)
        except Film.DoesNotExist:
            return Response([], status=200)

        reviews = FilmReview.objects.filter(film=film).order_by("-created_at")
        return Response(FilmReviewSerializer(reviews, many=True).data, status=200)

    def post(self, request, pk):
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"error": "text required"}, status=400)

        try:
            film = Film.objects.get(external_id=pk)
        except Film.DoesNotExist:
            return Response({"error": "Film not found"}, status=404)

        review = FilmReview.objects.create(
            user=request.user,
            film=film,
            text=text,
        )
        return Response(FilmReviewSerializer(review).data, status=201)


class BookReviewDetailUpdateDeleteView(APIView):
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self, pk):
        return BookReview.objects.get(id=pk)

    def get(self, request, pk):
        try:
            review = self.get_object(pk)
        except BookReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)

        return Response(BookReviewSerializer(review).data, status=200)

    def put(self, request, pk):
        try:
            review = self.get_object(pk)
        except BookReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)

        self.check_object_permissions(request, review)

        review.text = request.data.get("text", review.text)
        review.save()
        return Response(BookReviewSerializer(review).data, status=200)

    def delete(self, request, pk):
        try:
            review = self.get_object(pk)
        except BookReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)

        self.check_object_permissions(request, review)
        review.delete()
        return Response(status=204)


class FilmReviewDetailUpdateDeleteView(APIView):
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self, pk):
        return FilmReview.objects.get(id=pk)

    def get(self, request, pk):
        try:
            review = self.get_object(pk)
        except FilmReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)

        return Response(FilmReviewSerializer(review).data, status=200)

    def put(self, request, pk):
        try:
            review = self.get_object(pk)
        except FilmReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)

        self.check_object_permissions(request, review)

        review.text = request.data.get("text", review.text)
        review.save()
        return Response(FilmReviewSerializer(review).data, status=200)

    def delete(self, request, pk):
        try:
            review = self.get_object(pk)
        except FilmReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)

        self.check_object_permissions(request, review)
        review.delete()
        return Response(status=204)
