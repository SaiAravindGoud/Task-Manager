
import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create a production superuser from environment variables."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not all([username, email, password]):
            self.stdout.write(
                "Production superuser creation skipped: "
                "required environment variables are not set."
            )
            return

        User = get_user_model()
        existing_user = User.objects.filter(username=username).first()

        if existing_user:
            if existing_user.is_superuser:
                self.stdout.write(
                    self.style.SUCCESS("Production superuser already exists.")
                )
                return

            raise CommandError(
                "The requested username already belongs to a non-superuser."
            )

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS("Production superuser created successfully.")
        )
