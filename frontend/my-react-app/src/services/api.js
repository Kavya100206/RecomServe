import axios from 'axios';

// Use backend API URL from environment variable (Render) or localhost for development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class APIService {
    // Get recommendations for a user
    async getRecommendations(userId, count = 10) {
        try {
            const response = await axios.get(
                `${API_BASE}/api/recommendations/${userId}?n=${count}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            throw error;
        }
    }

    // Get model info
    async getModelInfo() {
        try {
            const response = await axios.get(
                `${API_BASE}/api/model/info`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching model info:', error);
            throw error;
        }
    }
}

export const apiService = new APIService();
