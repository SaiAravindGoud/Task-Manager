from django.contrib import admin
from .models import Category, Task


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "created_at")
    search_fields = ("name", "user__username", "user__email")
    list_filter = ("created_at",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "category",
        "status",
        "priority",
        "due_date",
        "created_at",
    )
    search_fields = ("title", "description", "user__username")
    list_filter = ("status", "priority", "created_at")
    readonly_fields = ("created_at", "updated_at", "completed_at")