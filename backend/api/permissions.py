# api/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    """
    Allow full access to owners (obj.user).
    Read-only for everyone else.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        user_field = getattr(obj, "user", None)
        if user_field:
            return user_field == request.user

        return False


class IsListOwnerOrReadOnly(BasePermission):
    """
    For CustomListItem: only the owner of the parent CustomList can modify.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        custom_list = getattr(obj, "custom_list", None)
        if not custom_list:
            return False

        return custom_list.user == request.user
