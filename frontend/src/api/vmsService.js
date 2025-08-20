const API_BASE_URL = 'http://localhost:8000';

class VMSService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      // Add timeout for better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timeout - server may be slow or unresponsive');
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error - cannot connect to server');
      }
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Stream Management
  async getStreams() {
    return this.request('/streams');
  }

  async createStream(streamData) {
    return this.request('/streams', {
      method: 'POST',
      body: JSON.stringify(streamData),
    });
  }

  async deleteStream(streamId) {
    return this.request(`/streams/${streamId}`, {
      method: 'DELETE',
    });
  }

  async getStreamResults(streamId) {
    return this.request(`/streams/${streamId}/results`);
  }

  // File Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout for file uploads
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error('Upload timeout - file may be too large or server is slow');
      }
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Alerts
  async getAlerts() {
    return this.request('/alerts');
  }

  // Health check
  async healthCheck() {
    return this.request('/');
  }

  // Get server status
  async getServerStatus() {
    try {
      const startTime = Date.now();
      await this.healthCheck();
      const responseTime = Date.now() - startTime;
      return { status: 'connected', responseTime };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }
}

export default new VMSService();
