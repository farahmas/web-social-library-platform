import requests
from django.conf import settings
from django.db import IntegrityError

from .models import Film

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

TMDB_API_KEY = getattr(settings, "TMDB_API_KEY", None)

TMDB_GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
}


def tmdb_get(path, params=None):
    if not TMDB_API_KEY:
        raise RuntimeError("TMDB_API_KEY is not configured in settings.py")

    url = f"{BASE_URL}{path}"
    params = params or {}
    params.setdefault("api_key", TMDB_API_KEY)
    params.setdefault("language", "en-US")

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()


def import_film(tmdb_id):
    data = tmdb_get(f"/movie/{tmdb_id}", params={"append_to_response": "credits"})

    poster_path = data.get("poster_path")
    poster_url = f"{IMAGE_BASE}{poster_path}" if poster_path else None

    release_date = data.get("release_date") or ""
    year_str = release_date[:4]  
    release_year = int(year_str) if year_str.isdigit() else None

    genres_list = data.get("genres", []) or []
    genres = ", ".join(g.get("name") for g in genres_list if g.get("name"))

    director_name = None
    credits = data.get("credits") or {}
    for crew_member in credits.get("crew", []):
        if crew_member.get("job") == "Director":
            director_name = crew_member.get("name")
            break

    defaults = {
        "title": data.get("title") or data.get("name") or "",
        "overview": data.get("overview") or "",
        "release_year": release_year,     
        "runtime": data.get("runtime") or 0,
        "director": director_name or "",
        "genres": genres,
        "poster_url": poster_url,
    }

    try:
        film, created = Film.objects.get_or_create(
            external_id=str(data.get("id")),
            defaults=defaults,
        )
    except IntegrityError:
        film = Film.objects.filter(external_id=str(data.get("id"))).first()
        if film is None:
            film = Film.objects.create(
                external_id=str(data.get("id")), **defaults
            )

    return film


def tmdb_search(query):
    url = f"{BASE_URL}/search/movie"
    params = {
        "api_key": settings.TMDB_API_KEY,
        "query": query,
        "language": "en-US",
    }
    results = requests.get(url, params=params, timeout=10).json().get("results", [])

    return [format_tmdb_film(item) for item in results]


def tmdb_trending():
    url = f"{BASE_URL}/trending/movie/week"
    params = {"api_key": settings.TMDB_API_KEY}
    results = requests.get(url, params=params, timeout=10).json().get("results", [])
    return [format_tmdb_film(item) for item in results]


def tmdb_popular():
    url = f"{BASE_URL}/movie/popular"
    params = {"api_key": settings.TMDB_API_KEY}
    results = requests.get(url, params=params, timeout=10).json().get("results", [])
    return [format_tmdb_film(item) for item in results]


def format_tmdb_film(item):
    poster_path = item.get("poster_path")
    poster_url = f"{IMAGE_BASE}{poster_path}" if poster_path else None

    genre_ids = item.get("genre_ids") or []

    genre_names = []
    for gid in genre_ids:
        name = TMDB_GENRE_MAP.get(gid)
        if name:
            genre_names.append(name)

    genres_str = ", ".join(genre_names)

    return {
        "external_id": str(item.get("id")),    
        "title": item.get("title"),
        "overview": item.get("overview"),
        "poster_url": poster_url,
        "year": (item.get("release_date") or "")[:4],
        "genres": genres_str,                  
        "genre_ids": genre_ids,                
        "genre_names": genre_names,            
        "rating": item.get("vote_average"),
    }
