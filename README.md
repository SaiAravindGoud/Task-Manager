# TaskFlow - Task Manager

A full-stack Task Management application built with Django REST Framework and React. It helps users organize daily tasks, manage categories, track progress, and stay productive.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Access token refresh
- Change password
- Protected routes

### Task Management
- Create, view, update, and delete tasks
- Mark tasks as completed
- Manage task status: Pending, In Progress, Completed
- Set priorities: Low, Medium, High
- Set task due dates
- Search, filter, sort, and paginate tasks

### Category Management
- Create categories
- Edit categories
- Delete categories

### Dashboard
- Total tasks
- Pending tasks
- In-progress tasks
- Completed tasks
- Overdue tasks

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- Axios
- React Router
- Lucide React
- CSS

**Backend**
- Python
- Django
- Django REST Framework
- MySQL
- Django REST Framework Simple JWT
- django-filter
- PyMySQL

## Project Structure

```text
Task-Manager/
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── tasks/
│   ├── .env.example
│   ├── .gitignore
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Requirements

- Python 3.12 or later
- Node.js and npm
- MySQL Server 8.0 or later

## Backend Setup

Navigate to the backend folder:

```powershell
cd backend
```

Create and activate a virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Create a MySQL database named `task_manager_db`.

Create your local `.env` file using `.env.example` as a reference. Configure the database credentials, Django secret key, debug settings, allowed hosts, and frontend URL.

Run migrations:

```powershell
python manage.py migrate
```

Start the backend:

```powershell
python manage.py runserver
```

Backend URL: http://127.0.0.1:8000/

## Frontend Setup

Open another PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173/

## Production Build

```powershell
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register/ | Register user |
| POST | /api/auth/login/ | User login |
| POST | /api/auth/refresh/ | Refresh access token |
| GET | /api/auth/me/ | Get current user |
| POST | /api/auth/change-password/ | Change password |
| GET, POST | /api/tasks/ | List and create tasks |
| GET, PUT, PATCH, DELETE | /api/tasks/{id}/ | Manage a task |
| PATCH | /api/tasks/{id}/toggle-complete/ | Toggle task completion |
| GET, POST | /api/categories/ | List and create categories |
| GET, PATCH, DELETE | /api/categories/{id}/ | Manage a category |
| GET | /api/dashboard/ | Dashboard statistics |

## Security

- JWT authentication
- Protected API endpoints
- User-specific task and category access
- Environment variables for sensitive configuration
- Git ignore rules for secrets and generated files

## Testing

The application was manually tested for:

- User registration and login
- Dashboard statistics
- Task creation, editing, completion, and deletion
- Category creation, editing, and deletion
- Password change and login with the new password

## Author

Developed as a Full Stack Task Management project.