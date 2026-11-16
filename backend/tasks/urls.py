
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, TaskViewSet, DashboardView


router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
]

urlpatterns += router.urls
