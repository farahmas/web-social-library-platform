# social/views.py
from rest_framework import generics, permissions
from .models import Follow
from .serializers import FollowSerializer

class FollowView(generics.ListCreateAPIView):
    """
    GET  /api/social/      -> list all follow relations
    POST /api/social/      -> create follow (current user -> following)
    """
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.all()

    def perform_create(self, serializer):
        """
        follower always = request.user
        frontend only sends: { "following": <user_id> }
        """
        serializer.save(follower=self.request.user)


class FollowDetailView(generics.DestroyAPIView):
    """
    DELETE /api/social/<pk>/ -> unfollow
    """
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)
