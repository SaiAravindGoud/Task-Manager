
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Task


User = get_user_model()


class TaskAndCategoryAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tasktester@example.com",
            email="tasktester@example.com",
            password="StrongPass!2026",
        )

        self.other_user = User.objects.create_user(
            username="otheruser@example.com",
            email="otheruser@example.com",
            password="StrongPass!2026",
        )

        self.client.force_authenticate(user=self.user)

        self.categories_url = "/api/categories/"
        self.tasks_url = "/api/tasks/"
        self.dashboard_url = "/api/dashboard/"

        self.category = Category.objects.create(
            user=self.user,
            name="Work",
        )

        self.task = Task.objects.create(
            user=self.user,
            category=self.category,
            title="Complete project",
            description="Finish project testing",
            status=Task.Status.PENDING,
            priority=Task.Priority.HIGH,
            due_date=timezone.now() + timedelta(days=5),
        )

    # CATEGORY TESTS

    def test_create_category(self):
        response = self.client.post(
            self.categories_url,
            {"name": "Personal"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Category.objects.filter(
                user=self.user,
                name="Personal",
            ).exists()
        )

    def test_list_categories(self):
        response = self.client.get(self.categories_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Work")

    def test_update_category(self):
        response = self.client.patch(
            f"{self.categories_url}{self.category.id}/",
            {"name": "Office"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.category.refresh_from_db()
        self.assertEqual(self.category.name, "Office")

    def test_delete_category(self):
        response = self.client.delete(
            f"{self.categories_url}{self.category.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Category.objects.filter(id=self.category.id).exists()
        )

    def test_duplicate_category_name_is_rejected(self):
        response = self.client.post(
            self.categories_url,
            {"name": "Work"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_category_list_is_user_specific(self):
        Category.objects.create(
            user=self.other_user,
            name="Private Category",
        )

        response = self.client.get(self.categories_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        names = [item["name"] for item in results]

        self.assertIn("Work", names)
        self.assertNotIn("Private Category", names)

    def test_user_cannot_access_another_users_category(self):
        other_category = Category.objects.create(
            user=self.other_user,
            name="Other Work",
        )

        response = self.client.get(
            f"{self.categories_url}{other_category.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # TASK TESTS

    def test_create_task(self):
        response = self.client.post(
            self.tasks_url,
            {
                "title": "Learn Django testing",
                "description": "Write automated tests",
                "category": self.category.id,
                "status": "Pending",
                "priority": "Medium",
                "due_date": (
                    timezone.now() + timedelta(days=10)
                ).isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Task.objects.filter(
                user=self.user,
                title="Learn Django testing",
            ).exists()
        )

    def test_list_tasks(self):
        response = self.client.get(self.tasks_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Complete project")

    def test_update_task(self):
        response = self.client.patch(
            f"{self.tasks_url}{self.task.id}/",
            {"title": "Updated project"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.task.refresh_from_db()
        self.assertEqual(self.task.title, "Updated project")

    def test_delete_task(self):
        response = self.client.delete(
            f"{self.tasks_url}{self.task.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Task.objects.filter(id=self.task.id).exists()
        )

    def test_toggle_task_completion(self):
        response = self.client.patch(
            f"{self.tasks_url}{self.task.id}/toggle-complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.task.refresh_from_db()
        self.assertEqual(
            self.task.status,
            Task.Status.COMPLETED,
        )
        self.assertIsNotNone(self.task.completed_at)

    def test_toggle_completed_task_back_to_pending(self):
        self.task.status = Task.Status.COMPLETED
        self.task.completed_at = timezone.now()
        self.task.save()

        response = self.client.patch(
            f"{self.tasks_url}{self.task.id}/toggle-complete/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.task.refresh_from_db()
        self.assertEqual(
            self.task.status,
            Task.Status.PENDING,
        )
        self.assertIsNone(self.task.completed_at)

    def test_task_search(self):
        response = self.client.get(
            self.tasks_url,
            {"search": "Complete project"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)

    def test_task_status_filter(self):
        response = self.client.get(
            self.tasks_url,
            {"status": "Pending"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)

    def test_task_priority_filter(self):
        response = self.client.get(
            self.tasks_url,
            {"priority": "High"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)

    def test_task_ordering(self):
        response = self.client.get(
            self.tasks_url,
            {"ordering": "title"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_task_list_is_user_specific(self):
        Task.objects.create(
            user=self.other_user,
            title="Private task",
            description="Another user's task",
            priority=Task.Priority.LOW,
        )

        response = self.client.get(self.tasks_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get("results", response.data)
        titles = [item["title"] for item in results]

        self.assertIn("Complete project", titles)
        self.assertNotIn("Private task", titles)

    def test_user_cannot_access_another_users_task(self):
        other_task = Task.objects.create(
            user=self.other_user,
            title="Private task",
        )

        response = self.client.get(
            f"{self.tasks_url}{other_task.id}/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_modify_another_users_task(self):
        other_task = Task.objects.create(
            user=self.other_user,
            title="Private task",
        )

        response = self.client.patch(
            f"{self.tasks_url}{other_task.id}/",
            {"title": "Hacked task"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        other_task.refresh_from_db()
        self.assertEqual(other_task.title, "Private task")

    def test_user_cannot_use_another_users_category(self):
        other_category = Category.objects.create(
            user=self.other_user,
            name="Private Category",
        )

        response = self.client.post(
            self.tasks_url,
            {
                "title": "Invalid category task",
                "category": other_category.id,
                "priority": "Medium",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # DASHBOARD TESTS

    def test_dashboard_statistics(self):
        Task.objects.create(
            user=self.user,
            title="In progress task",
            status=Task.Status.IN_PROGRESS,
        )

        Task.objects.create(
            user=self.user,
            title="Completed task",
            status=Task.Status.COMPLETED,
            completed_at=timezone.now(),
        )

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_tasks"], 3)
        self.assertEqual(response.data["pending_tasks"], 1)
        self.assertEqual(response.data["in_progress_tasks"], 1)
        self.assertEqual(response.data["completed_tasks"], 1)

    def test_dashboard_is_user_specific(self):
        Task.objects.create(
            user=self.other_user,
            title="Other user's task",
        )

        response = self.client.get(self.dashboard_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_tasks"], 1)

    def test_dashboard_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.dashboard_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
