# CareerSage Technology Stack & Architecture

This document provides an overview of the CareerSage project architecture, file structure, and the key technologies/libraries used across the stack.

## 📁 Project Structure & File Roles

### 1. Frontend (`/frontend`)
The frontend is built with pure HTML, Vanilla JavaScript, and TailwindCSS for styling.
- **`index.html`**: Main landing page with Hero section, Features, and Live Stats.
- **`login.html` & `register.html`**: Authentication pages featuring glassmorphism UI and dynamic password validation.
- **`roadmaps.html` & `roadmap-visual.html`**: Pages to browse available roadmaps and view the detailed visual learning paths.
- **`skill-test.html`**: Interface for adaptive AI-generated skill quizzes.
- **`skill-battle.html`**: Interface for real-time 1v1 rapid-fire battles.
- **`js/api.js`**: Centralized wrapper for making fetch calls to the backend API. Handles tokens and endpoints.
- **`js/main.js`**: Core frontend logic. Handles UI rendering, modals (like Change Password and Help & Support), and page-specific initialization.
- **`js/load-header-footer.js`**: Standalone script that injects the navigation bar and footer across all pages to keep code DRY.

### 2. Backend (`/backend`)
The backend is a monolithic REST API built with Python and Flask.
- **`app/__init__.py`**: Application factory where Flask, MongoDB, and JWT are initialized.
- **`app/routes/`**: Contains the API endpoints.
  - `auth.py`: Login, registration, password management.
  - `quiz.py`: Skill test generation and submission.
  - `ai.py`: Endpoints for generating personalized content.
  - `battle.py`: Logic for 1v1 real-time competitive battles.
- **`app/models/`**: Defines MongoDB document schemas (e.g., `notification.py`, `battle.py`).
- **`app/services/ai_service.py`**: Encapsulates the logic for communicating with the AI provider (using NVIDIA API) to generate roadmaps and questions.

### 3. DevOps & Infrastructure (`/terraform`, `/.github`, `/ssl`)
- **`docker-compose.yml` & `Dockerfile`**: Containerizes the Flask app, MongoDB, and Nginx.
- **`terraform/`**: Infrastructure as Code (IaC) to provision the AWS EC2 instance.
- **`.github/workflows/pipeline.yml`**: CI/CD pipeline that auto-deploys to EC2 on push to the `main` branch. It builds the Docker image, pushes to DockerHub, and updates the EC2 instance safely (preserving SSL).
- **`ssl/`**: Documentation (`ssl.md`) and scripts detailing the Nginx Certbot setup for HTTPS.

---

## 🛠️ Key Technologies & Libraries

### Frontend
- **HTML5 / CSS3**: Core markup and styling.
- **Vanilla JavaScript**: DOM manipulation without heavy frameworks like React, keeping the bundle extremely light.
- **TailwindCSS**: Utility-first CSS framework used for rapid UI development, responsive grids (e.g., 2x2 stats on mobile), and glassmorphism effects.
- **Canva Templates**: Used to design and export custom graphical assets, particularly for the **Roadmap Visualization** features to make the learning paths look premium and engaging.

### Backend (Python)
- **`Flask` (v3.0.0)**: The core lightweight web framework. Chosen for its simplicity and speed in building REST APIs.
- **`Flask-RESTful` & `flask-cors`**: For structuring APIs and allowing the frontend to communicate with the backend seamlessly.
- **`flask-socketio` & `eventlet`**: Enables WebSockets for real-time bidirectional communication. Used specifically to power the real-time **1v1 Rapid Fire Battles**.
- **`pymongo` & `flask-mongoengine`**: ODM (Object-Document Mapper) to interface with the MongoDB database. Chosen for flexibility with unstructured data (like AI-generated roadmaps).
- **`Flask-JWT-Extended` & `bcrypt`**: Handles secure user authentication via JSON Web Tokens and encrypts user passwords in the database.
- **`openai`**: Python SDK used to interface with Large Language Models. In this project, it is configured to use the **NVIDIA API endpoint** (via `NVIDIA_API_KEY`) to generate personalized AI roadmaps and quizzes.
- **`gunicorn`**: A Python WSGI HTTP Server used in production to serve the Flask application robustly inside the Docker container.

### Database
- **MongoDB**: NoSQL database running in a Docker container, ideal for storing flexible schema documents like user profiles, generated roadmaps, and quiz histories.
