# activity/views.py
from django.db.models import Count, Q
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Activity, ActivityLike
from .serializers import ActivitySerializer


class ActivityFeedView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        qs = Activity.objects.all()

        user_filter = self.request.GET.get("user")
        if user_filter:
            try:
                uid = int(user_filter)
                qs = qs.filter(user_id=uid)
            except ValueError:
                pass
        else:
            following_ids = user.following.values_list("following_id", flat=True)
            qs = qs.filter(user_id__in=list(following_ids) + [user.id])

        filter_type = self.request.GET.get("type")
        if filter_type:
            qs = qs.filter(activity_type__icontains=filter_type)

        qs = qs.annotate(
            like_count=Count("likes", distinct=True),
            liked_by_me=Count(
                "likes",
                filter=Q(likes__user=user),
                distinct=True,
            ),
        ).order_by("-created_at")

        return qs


class ActivityLikeToggleView(APIView):
    """
    POST /api/activity/<pk>/like/

    Eğer kullanıcı daha önce beğenmemişse like oluşturur,
    daha önce beğenmişse like'ı siler (toggle).
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            activity = Activity.objects.get(pk=pk)
        except Activity.DoesNotExist:
            return Response({"detail": "Activity not found"}, status=404)

        like, created = ActivityLike.objects.get_or_create(
            user=request.user,
            activity=activity,
        )

        if not created:
            like.delete()
            liked = False
        else:
            liked = True

        like_count = ActivityLike.objects.filter(activity=activity).count()

        return Response(
            {
                "liked": liked,
                "like_count": like_count,
            }
        )
