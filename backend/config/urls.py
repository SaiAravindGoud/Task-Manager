
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def home(request):
    return JsonResponse({
        "message": "Task Manager API is running successfully!",
        "status": "healthy",
        "application": "Task Manager",
        "version": "1.0.0",
        "endpoints": {
            "authentication": "/api/auth/",
            "tasks": "/api/",
            "admin": "/admin/",
        },
    })


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("tasks.urls")),
]
