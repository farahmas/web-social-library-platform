from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import CustomList, CustomListItem
from .serializers import CustomListSerializer, CustomListItemSerializer
from api.permissions import IsOwnerOrReadOnly, IsListOwnerOrReadOnly

class CustomListView(generics.ListCreateAPIView):
    queryset = CustomList.objects.all()
    serializer_class = CustomListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # list always belongs to the logged-in user
        serializer.save(user=self.request.user)


class CustomListDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomList.objects.all()
    serializer_class = CustomListSerializer
    permission_classes = [IsOwnerOrReadOnly]


class CustomListItemView(generics.ListCreateAPIView):
    queryset = CustomListItem.objects.all()
    serializer_class = CustomListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        custom_list_id = data.get("custom_list")
        content_type = data.get("content_type")
        book_id = data.get("book")
        film_id = data.get("film")

        if not custom_list_id or not content_type:
            return Response(
                {"error": "custom_list and content_type required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = CustomListItem.objects.filter(custom_list_id=custom_list_id)

        if content_type == "book" and book_id:
            qs = qs.filter(content_type="book", book_id=book_id)
        elif content_type == "film" and film_id:
            qs = qs.filter(content_type="film", film_id=film_id)
        else:
            return Response(
                {"error": "book or film id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = qs.first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)


class CustomListItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomListItem.objects.all()
    serializer_class = CustomListItemSerializer
    permission_classes = [IsListOwnerOrReadOnly]
