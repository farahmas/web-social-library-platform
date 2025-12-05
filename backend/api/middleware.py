import traceback
from django.http import JsonResponse

class GlobalExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            return self.get_response(request)
        except Exception as exc:
            return JsonResponse({
                "success": False,
                "error": str(exc),
            }, status=500)
