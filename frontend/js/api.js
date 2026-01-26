/**
 * CareerSage API Service
 * Handles all communication with the Flask backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Token management
const TokenManager = {
    getToken() {
        return localStorage.getItem('access_token');
    },
    
    setToken(token) {
        localStorage.setItem('access_token', token);
    },
    
    removeToken() {
        localStorage.removeItem('access_token');
    },
    
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Base API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeader(),
        ...options.headers
    };
    
    // Debug logging
    console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('📤 Headers:', headers);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error || 'Request failed',
                data
            };
        }
        
        return data;
    } catch (error) {
        if (error.status) {
            throw error;
        }
        throw {
            status: 0,
            message: 'Network error. Please check your connection.',
            data: null
        };
    }
}

// ============ Auth API ============
const AuthAPI = {
    async register(email, password, name) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
        
        if (data.access_token) {
            TokenManager.setToken(data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    },
    
    async login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.access_token) {
            TokenManager.setToken(data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    },
    
    async logout() {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore errors on logout
        }
        TokenManager.removeToken();
        localStorage.removeItem('user');
    },
    
    async getProfile() {
        return await apiRequest('/auth/me');
    },
    
    async updateProfile(data) {
        return await apiRequest('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    isAuthenticated() {
        return !!TokenManager.getToken();
    },
    
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// ============ Roadmaps API ============
const RoadmapsAPI = {
    async getAll(category = null) {
        const url = category ? `/roadmaps/?category=${category}` : '/roadmaps/';
        return await apiRequest(url);
    },
    
    async getBySlug(slug) {
        return await apiRequest(`/roadmaps/${slug}`);
    },
    
    async getById(id) {
        return await apiRequest(`/roadmaps/id/${id}`);
    },
    
    async getCategories() {
        return await apiRequest('/roadmaps/categories');
    },
    
    // User roadmaps (requires auth)
    async getUserRoadmaps() {
        return await apiRequest('/roadmaps/user');
    },
    
    async saveUserRoadmap(roadmapData) {
        return await apiRequest('/roadmaps/user', {
            method: 'POST',
            body: JSON.stringify(roadmapData)
        });
    },
    
    async updateUserRoadmap(id, data) {
        return await apiRequest(`/roadmaps/user/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async deleteUserRoadmap(id) {
        return await apiRequest(`/roadmaps/user/${id}`, {
            method: 'DELETE'
        });
    },
    
    async updateNodeProgress(roadmapId, nodeId, completed = true) {
        return await apiRequest(`/roadmaps/user/${roadmapId}/progress`, {
            method: 'POST',
            body: JSON.stringify({ node_id: nodeId, completed })
        });
    }
};

// ============ Quiz API ============
const QuizAPI = {
    async getQuestions(category = 'frontend') {
        return await apiRequest(`/quiz/questions?category=${category}`);
    },
    
    async submitQuiz(category, answers, timeTaken = null) {
        return await apiRequest('/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({
                category,
                answers,
                time_taken_seconds: timeTaken
            })
        });
    },
    
    async getResults() {
        return await apiRequest('/quiz/results');
    },
    
    async getResultById(id) {
        return await apiRequest(`/quiz/results/${id}`);
    }
};

// ============ Dashboard API ============
const DashboardAPI = {
    async getStats() {
        return await apiRequest('/dashboard/stats');
    },
    
    async getRoadmaps() {
        return await apiRequest('/dashboard/roadmaps');
    },
    
    async getActivity() {
        return await apiRequest('/dashboard/activity');
    },
    
    async getSkills() {
        return await apiRequest('/dashboard/skills');
    },
    
    async getProgress() {
        return await apiRequest('/dashboard/progress');
    }
};

// ============ AI API ============
const AIAPI = {
    async generateRoadmap(topic, skills = [], experienceLevel = 'beginner', careerGoal = 'frontend-developer') {
        return await apiRequest('/ai/generate-roadmap', {
            method: 'POST',
            body: JSON.stringify({
                topic,
                skills,
                experience_level: experienceLevel,
                career_goal: careerGoal
            })
        });
    },
    
    async chat(message, context = {}) {
        return await apiRequest('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, context })
        });
    },
    
    async suggestResources(topic, skillLevel = 'beginner') {
        return await apiRequest('/ai/suggest-resources', {
            method: 'POST',
            body: JSON.stringify({ topic, skill_level: skillLevel })
        });
    }
};

// Export for use in other scripts
window.API = {
    Auth: AuthAPI,
    Roadmaps: RoadmapsAPI,
    Quiz: QuizAPI,
    Dashboard: DashboardAPI,
    AI: AIAPI,
    Token: TokenManager
};

console.log('✅ CareerSage API Service loaded');
