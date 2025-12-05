# books/services.py
import requests
from .models import Book

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes/"


def google_books_search(query):
    url = GOOGLE_BOOKS_URL
    params = {"q": query}
    r = requests.get(url, params=params).json()

    items = r.get("items", [])
    formatted = []

    for item in items:
        info = item.get("volumeInfo", {}) or {}

        formatted.append({
            "google_id": item.get("id"),
            "title": info.get("title"),
            "authors": info.get("authors", []),
            "description": info.get("description"),
            "thumbnail": (info.get("imageLinks") or {}).get("thumbnail"),
            "year": (info.get("publishedDate") or "")[:4],
            "page_count": info.get("pageCount"),
        })

    return formatted


def _safe_int(value):
    if value in (None, ""):
        return None
    try:
        return int(str(value)[:4]) 
    except (TypeError, ValueError):
        return None


def import_book(google_id):
    url = GOOGLE_BOOKS_URL + google_id
    r = requests.get(url).json()
    info = r.get("volumeInfo", {}) or {}

    publish_year = _safe_int(info.get("publishedDate"))
    page_count = _safe_int(info.get("pageCount"))

    book, created = Book.objects.get_or_create(
        external_id=google_id,
        defaults={
            "title": info.get("title") or "",
            "authors": ", ".join(info.get("authors", [])),
            "description": info.get("description") or "",
            "page_count": page_count,
            "publish_year": publish_year,
            "cover_url": (info.get("imageLinks") or {}).get("thumbnail", ""),
        },
    )
    return book
