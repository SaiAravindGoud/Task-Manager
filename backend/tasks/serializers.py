
from django.utils import timezone
from rest_framework import serializers

from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Category name cannot be empty."
            )

        user = self.context["request"].user

        existing = Category.objects.filter(
            user=user,
            name__iexact=value,
        )

        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                "You already have a category with this name."
            )

        return value


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "category",
            "status",
            "priority",
            "due_date",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Task title cannot be empty."
            )

        return value

    def validate_category(self, value):
        if value is not None:
            user = self.context["request"].user

            if value.user_id != user.id:
                raise serializers.ValidationError(
                    "You can only use your own categories."
                )

        return value

    def validate_due_date(self, value):
        if value is not None and value < timezone.now():
            raise serializers.ValidationError(
                "Due date cannot be in the past."
            )

        return value

    def create(self, validated_data):
        if validated_data.get("status") == Task.Status.COMPLETED:
            validated_data["completed_at"] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get(
            "status",
            instance.status,
        )

        if new_status == Task.Status.COMPLETED:
            if instance.status != Task.Status.COMPLETED:
                validated_data["completed_at"] = timezone.now()

        else:
            validated_data["completed_at"] = None

        return super().update(instance, validated_data)
