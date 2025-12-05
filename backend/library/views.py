from rest_framework import generics, permissions
from .models import BookLibraryStatus, FilmLibraryStatus
from .serializers import BookLibraryStatusSerializer, FilmLibraryStatusSerializer
from api.permissions import IsOwnerOrReadOnly

class BookLibraryStatusView(generics.ListCreateAPIView):
    queryset = BookLibraryStatus.objects.all()
    serializer_class = BookLibraryStatusSerializer
    permission_classes = [permissions.IsAuthenticated]


class FilmLibraryStatusView(generics.ListCreateAPIView):
    queryset = FilmLibraryStatus.objects.all()
    serializer_class = FilmLibraryStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

from rest_framework.views import APIView
from rest_framework.response import Response
from library.stats import get_user_library_stats

class LibraryStatsView(APIView):
    def get(self, request, user_id):
        stats = get_user_library_stats(user_id)
        return Response(stats)

class BookLibraryStatusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookLibraryStatus.objects.all()
    serializer_class = BookLibraryStatusSerializer
    permission_classes = [IsOwnerOrReadOnly]


class FilmLibraryStatusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FilmLibraryStatus.objects.all()
    serializer_class = FilmLibraryStatusSerializer
    permission_classes = [IsOwnerOrReadOnly]
