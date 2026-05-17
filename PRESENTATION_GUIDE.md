# CareerSage - Presentation & Architecture Guide

This document is designed to help you and your team present the CareerSage project. It covers the core features, the tech stack, architectural decisions (the "Why"), and key talking points for your presentation tomorrow.

---

## 🚀 1. Project Overview
**CareerSage** is an AI-powered career planning and guidance platform. It acts as a personal mentor ("AI Sensie") that generates dynamic, highly personalized learning roadmaps for users based on their current skills, goals, and desired career paths. 

### Core Features to Highlight:
1. **AI-Powered Roadmaps:** Users enter what they want to learn (e.g., "Frontend Development"), and the system generates a visual, step-by-step roadmap using NVIDIA's AI models.
2. **Real-Time Streaming Progress:** Instead of a static loading screen, users see a live progress bar updating via WebSockets as the AI thinks.
3. **Skill Battles (Battle Arena):** A gamified way for users to test their knowledge.
4. **Peer Connection:** Users can connect and learn together.

---

## 🛠️ 2. The Tech Stack & "Why We Chose It"

### Frontend (User Interface)
* **Technologies:** HTML5, Vanilla JavaScript, TailwindCSS.
* **Why we chose it:** 
  * **TailwindCSS** allowed us to build a stunning, glassmorphism-inspired, highly responsive UI incredibly fast without writing thousands of lines of custom CSS. 
  * **Vanilla JS** keeps the frontend lightweight and fast, without the overhead of heavy frameworks like React.

### Backend (The Brain)
* **Technology:** Python with Flask.
* **Why we chose it:** 
  * Python is the absolute best language for AI integrations. 
  * Flask is a lightweight micro-framework that allowed us to build exactly what we needed (REST APIs and WebSockets) without unnecessary bloat.

### Database
* **Technology:** MongoDB (NoSQL).
* **Why we chose it:** 
  * Career roadmaps are highly dynamic tree/graph structures (JSON). Relational databases (like MySQL) would require complex joins to store these roadmaps. MongoDB stores JSON-like documents naturally, making roadmap retrieval instantly fast.

### AI Engine
* **Technology:** NVIDIA NIM API using **Llama 3.1 (8B Instruct model)**.
* **Why we chose it:** 
  * We specifically chose the **8B model** because it offers the perfect balance of intelligence and **extreme speed** (~15 second generation times). Using a larger model (like 70B) would have made users wait 4+ minutes.

### Real-Time Communication
* **Technology:** Socket.IO with Eventlet.
* **Why we chose it:** 
  * Standard HTTP requests force the user to stare at a blank screen until the AI finishes. WebSockets (Socket.IO) keep an open connection, allowing the server to push real-time updates (e.g., "🧠 Generating roadmap...", "⚡ Fetching resources...") to the user's screen.

---

## 🌩️ 3. Infrastructure & Deployment (The "Flex" Section)
*This is where you impress your evaluators with your production-grade architecture.*

* **Cloud Provider:** AWS (Amazon Web Services) EC2 Instance.
* **Containerization:** Docker & Docker Compose.
  * **Why:** "It works on my machine" is a terrible excuse. By containerizing the app, we ensured that it runs exactly the same on the AWS production server as it does on our local laptops.
* **Web Server / Proxy:** Nginx.
  * **Why:** Nginx sits in front of our Flask app, handling security, SSL certificates, and routing traffic efficiently.
* **CI/CD Pipeline:** GitHub Actions.
  * **Why:** We implemented an automated pipeline. Whenever we push code to the `main` branch, GitHub automatically tests, builds, and pushes the new Docker image to our live AWS server within minutes, with zero downtime.

---

## 🐛 4. Challenges Faced & How We Solved Them
*Evaluators love hearing about problems you overcame. Use these as talking points!*

**Challenge 1: The AI Timeout Problem on AWS**
* **The Issue:** The AI roadmap generation worked perfectly locally but was freezing and timing out on the live AWS server.
* **The Solution:** We realized that our production server (Gunicorn) was loading "blocking" network sockets before our asynchronous library (`eventlet`) could patch them. We created a dedicated `gunicorn.conf.py` file to force the asynchronous "monkey patch" to happen before the app even started, making all AI network calls non-blocking and instantly fixing the timeout.

**Challenge 2: Slow AI Generation**
* **The Issue:** Roadmaps were taking 3-4 minutes to generate.
* **The Solution:** We implemented **Connection Pooling**. Instead of creating a brand new TCP handshake for every AI request (which wastes 300ms each time), we opened a persistent connection. We also strictly enforced the faster **8B parameter AI model** to ensure user requests finish in under 20 seconds. Finally, we added a strict **fail-fast timeout (40s)** so if an AI API key fails, it instantly falls back to a backup key without making the user wait.

---

## 📋 5. Suggested Presentation Flow

1. **The Hook:** Start by asking the audience if they've ever felt lost trying to learn a new skill (like Web Dev or Machine Learning).
2. **The Solution:** Introduce CareerSage as their personal, AI-driven guide.
3. **Live Demo:** 
   * Show the UI. 
   * Generate a roadmap live (highlight the real-time progress bar).
   * Show the generated roadmap and how users can interact with it.
4. **Under the Hood:** Show the architecture diagram (Frontend -> Flask -> MongoDB & NVIDIA AI).
5. **The Deployment:** Brag about your AWS Docker setup and GitHub Actions pipeline.
6. **Q&A:** Be ready to answer why you chose MongoDB over SQL, or why you used Flask over Django!
