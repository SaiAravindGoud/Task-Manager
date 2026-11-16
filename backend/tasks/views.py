
from django.db.models import Q
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = ["status", "priority", "category"]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = [
        "due_date",
        "created_at",
        "updated_at",
        "priority",
        "status",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user
        ).select_related("category")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(
        detail=True,
        methods=["patch"],
        url_path="toggle-complete",
    )
    def toggle_complete(self, request, pk=None):
        task = self.get_object()

        if task.status == Task.Status.COMPLETED:
            new_status = Task.Status.PENDING
        else:
            new_status = Task.Status.COMPLETED

        serializer = self.get_serializer(
            task,
            data={"status": new_status},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(user=request.user)

        now = timezone.now()

        total = tasks.count()
        pending = tasks.filter(
            status=Task.Status.PENDING
        ).count()
        in_progress = tasks.filter(
            status=Task.Status.IN_PROGRESS
        ).count()
        completed = tasks.filter(
            status=Task.Status.COMPLETED
        ).count()
        overdue = tasks.filter(
            due_date__lt=now
        ).exclude(
            status=Task.Status.COMPLETED
        ).count()

        return Response({
            "total_tasks": total,
            "pending_tasks": pending,
            "in_progress_tasks": in_progress,
            "completed_tasks": completed,
            "overdue_tasks": overdue,
        })
