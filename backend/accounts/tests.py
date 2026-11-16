from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AccountAPITests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.refresh_url = "/api/auth/refresh/"
        self.me_url = "/api/auth/me/"
        self.change_password_url = "/api/auth/change-password/"

        self.email = "accounttest@example.com"
        self.password = "StrongPass!2026"

        self.user = User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password,
            first_name="Account",
            last_name="Tester",
        )

    def test_user_registration(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "New Test User",
                "email": "newuser@example.com",
                "password": "AnotherStrong!2026",
                "confirm_password": "AnotherStrong!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(email="newuser@example.com").exists()
        )
        self.assertEqual(response.data["user"]["full_name"], "New Test User")

    def test_duplicate_email_registration_fails(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "Duplicate User",
                "email": self.email,
                "password": "AnotherStrong!2026",
                "confirm_password": "AnotherStrong!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_password_mismatch_fails(self):
        response = self.client.post(
            self.register_url,
            {
                "full_name": "Mismatch User",
                "email": "mismatch@example.com",
                "password": "StrongPass!2026",
                "confirm_password": "DifferentPass!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            User.objects.filter(email="mismatch@example.com").exists()
        )

    def test_user_login_returns_jwt_tokens(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], self.email)

    def test_invalid_login_fails(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.email,
                "password": "WrongPassword!2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_authenticated_user_can_view_profile(self):
        login_response = self.client.post(
            self.login_url,
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        access_token = login_response.data["access"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.email)

    def test_profile_requires_authentication(self):
        response = self.client.get(self.me_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_refresh_token_returns_new_access_token(self):
        login_response = self.client.post(
            self.login_url,
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        refresh_token = login_response.data["refresh"]

        response = self.client.post(
            self.refresh_url,
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_authenticated_user_can_change_password(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.change_password_url,
            {
                "old_password": self.password,
                "new_password": "NewSecure!Pass2026",
                "confirm_new_password": "NewSecure!Pass2026",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(
            self.user.check_password("NewSecure!Pass2026")
        )