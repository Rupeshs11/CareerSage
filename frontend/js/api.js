/**
 * CareerSage API Service
 * Handles all communication with the Flask backend
 */

// Use relative URL since frontend and backend run on same server
const API_BASE_URL = "/api";

// Token management
const TokenManager = {
  getToken() {
    return localStorage.getItem("access_token");
  },

  setToken(token) {
    localStorage.setItem("access_token", token);
  },

  removeToken() {
    localStorage.removeItem("access_token");
  },

  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Base API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...TokenManager.getAuthHeader(),
    ...options.headers,
  };

  // Debug logging
  console.log(`🌐 API Request: ${options.method || "GET"} ${endpoint}`);
  console.log("📤 Auth Header:", headers.Authorization ? "Present" : "MISSING");

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Auto-redirect to login on 401 (expired/missing token)
      if (response.status === 401 && !endpoint.includes("/auth/")) {
        console.warn("🔒 Session expired, redirecting to login...");
        TokenManager.removeToken();
        localStorage.removeItem("user");
        if (
          !window.location.pathname.includes("login.html") &&
          !window.location.pathname.includes("index.html")
        ) {
          window.location.href = "./login.html?expired=1";
          return;
        }
      }
      throw {
        status: response.status,
        message: data.error || "Request failed",
        data,
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 0,
      message: "Network error. Please check your connection.",
      data: null,
    };
  }
}

// ============ Auth API ============
const AuthAPI = {
  async register(email, password, name) {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    if (data.access_token) {
      TokenManager.setToken(data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  async login(email, password) {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.access_token) {
      TokenManager.setToken(data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  async logout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore errors on logout
    }
    TokenManager.removeToken();
    localStorage.removeItem("user");
  },

  async getProfile() {
    return await apiRequest("/auth/me");
  },

  async updateProfile(data) {
    return await apiRequest("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  isAuthenticated() {
    return !!TokenManager.getToken();
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ============ Roadmaps API ============
const RoadmapsAPI = {
  async getAll(category = null) {
    const url = category ? `/roadmaps/?category=${category}` : "/roadmaps/";
    return await apiRequest(url);
  },

  async getBySlug(slug) {
    return await apiRequest(`/roadmaps/${slug}`);
  },

  async getById(id) {
    return await apiRequest(`/roadmaps/id/${id}`);
  },

  async getCategories() {
    return await apiRequest("/roadmaps/categories");
  },

  // User roadmaps (requires auth)
  async getUserRoadmaps() {
    return await apiRequest("/roadmaps/user");
  },

  async saveUserRoadmap(roadmapData) {
    return await apiRequest("/roadmaps/user", {
      method: "POST",
      body: JSON.stringify(roadmapData),
    });
  },

  async updateUserRoadmap(id, data) {
    return await apiRequest(`/roadmaps/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteUserRoadmap(id) {
    return await apiRequest(`/roadmaps/user/${id}`, {
      method: "DELETE",
    });
  },

  async updateNodeProgress(roadmapId, nodeId, completed = true) {
    return await apiRequest(`/roadmaps/user/${roadmapId}/progress`, {
      method: "POST",
      body: JSON.stringify({ node_id: nodeId, completed }),
    });
  },
};

// ============ Quiz API ============
const QuizAPI = {
  async getQuestions(category = "frontend") {
    return await apiRequest(`/quiz/questions?category=${category}`);
  },

  async submitQuiz(category, answers, timeTaken = null) {
    return await apiRequest("/quiz/submit", {
      method: "POST",
      body: JSON.stringify({
        category,
        answers,
        time_taken_seconds: timeTaken,
      }),
    });
  },

  async getResults() {
    return await apiRequest("/quiz/results");
  },

  async getResultById(id) {
    return await apiRequest(`/quiz/results/${id}`);
  },
};

// ============ Dashboard API ============
const DashboardAPI = {
  async getStats() {
    return await apiRequest("/dashboard/stats");
  },

  async getRoadmaps() {
    return await apiRequest("/dashboard/roadmaps");
  },

  async getRoadmapById(id) {
    return await apiRequest(`/dashboard/roadmaps/${id}`);
  },

  async getActivity() {
    return await apiRequest("/dashboard/activity");
  },

  async getSkills() {
    return await apiRequest("/dashboard/skills");
  },

  async getWeeklyActivity() {
    return await apiRequest("/dashboard/weekly-activity");
  },

  async getProgress() {
    return await apiRequest("/dashboard/progress");
  },

  async saveTestResult(data) {
    return await apiRequest("/dashboard/test-results", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getTestHistory() {
    return await apiRequest("/dashboard/test-history");
  },
};

// ============ AI API ============
const AIAPI = {
  async generateRoadmap(
    topic,
    skills = [],
    experienceLevel = "beginner",
    careerGoal = "frontend-developer",
  ) {
    return await apiRequest("/ai/generate-roadmap", {
      method: "POST",
      body: JSON.stringify({
        topic,
        skills,
        experience_level: experienceLevel,
        career_goal: careerGoal,
      }),
    });
  },

  async chat(message, context = {}) {
    return await apiRequest("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, context }),
    });
  },

  async suggestResources(topic, skillLevel = "beginner") {
    return await apiRequest("/ai/suggest-resources", {
      method: "POST",
      body: JSON.stringify({ topic, skill_level: skillLevel }),
    });
  },

  async searchResources(skill) {
    return await apiRequest("/ai/search-resources", {
      method: "POST",
      body: JSON.stringify({ skill }),
    });
  },

  async generateSkillTest(skill, topics = []) {
    return await apiRequest("/ai/generate-skill-test", {
      method: "POST",
      body: JSON.stringify({ skill, topics }),
    });
  },
};

// ============ Battle API ============
const BattleAPI = {
  async getLeaderboard() {
    return await apiRequest("/battle/leaderboard");
  },

  async getStats() {
    return await apiRequest("/battle/stats");
  },

  async getHistory() {
    return await apiRequest("/battle/history");
  },

  async getActiveBattles() {
    return await apiRequest("/battle/active");
  },
};

// ============ Friends & Notifications API ============
const FriendsAPI = {
  async getFriends() {
    return await apiRequest("/friends/list");
  },

  async sendFriendRequest(emailOrId) {
    const body = emailOrId.includes("@")
      ? { email: emailOrId }
      : { target_id: emailOrId };
    return await apiRequest("/friends/add", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async acceptFriendRequest(notificationId) {
    return await apiRequest("/friends/accept", {
      method: "POST",
      body: JSON.stringify({ notification_id: notificationId }),
    });
  },

  async removeFriend(friendId) {
    return await apiRequest("/friends/remove", {
      method: "POST",
      body: JSON.stringify({ friend_id: friendId }),
    });
  },

  async getNotifications() {
    return await apiRequest("/friends/notifications");
  },

  async markNotificationsRead(notificationId) {
    const body = notificationId ? { notification_id: notificationId } : {};
    return await apiRequest("/friends/notifications/read", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// Export for use in other scripts
window.API = {
  Auth: AuthAPI,
  Roadmaps: RoadmapsAPI,
  Quiz: QuizAPI,
  Dashboard: DashboardAPI,
  AI: AIAPI,
  Battle: BattleAPI,
  Friends: FriendsAPI,
  Token: TokenManager,
};

console.log("CareerSage API Service loaded");
