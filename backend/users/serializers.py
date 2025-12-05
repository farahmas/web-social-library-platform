from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["avatar", "bio", "created_at"]

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar

        if obj.avatar_file:
            request = self.context.get("request")
            url = obj.avatar_file.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url

        return None


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["avatar", "bio", "avatar_file"]
