import axios from 'axios';

const ML_API_BASE = 'http://localhost:8000';

class APIService {
    // Get recommendations for a user
    async getRecommendations(userId, count = 10) {
        try {
            const response = await axios.get(
                `${ML_API_BASE}/recommendations/${userId}?n=${count}`
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
                `${ML_API_BASE}/recommendations/model/info`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching model info:', error);
            throw error;
        }
    }
}

export const apiService = new APIService();
