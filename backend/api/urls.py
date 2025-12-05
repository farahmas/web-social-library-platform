from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [

    path("admin/", admin.site.urls),

    path("api/users/", include("users.urls")),
    path("api/auth/", include("authentication.urls")),

    path("api/books/", include("books.urls")),
    path("api/films/", include("films.urls")),

    path("api/ratings/", include("ratings.urls")),
    path("api/reviews/", include("reviews.urls")),

    path("api/library/", include("library.urls")),
    path("api/social/", include("social.urls")),
    path("api/activity/", include("activity.urls")),

    path("api/custom-lists/", include("custom_lists.urls")),  # list & list item CRUD
]

urlpatterns += [
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema")),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)