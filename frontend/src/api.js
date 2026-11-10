import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getStats = () => api.get('/stats');
export const getCases = () => api.get('/cases');
export const getCase = (id) => api.get(`/cases/${id}`);
export const createCase = (data) => api.post('/cases', data);
export const addDocument = (caseId, data) => api.post(`/cases/${caseId}/documents`, data);
export const analyzeCase = (caseId) => api.post(`/cases/${caseId}/analyze`);
export const askCopilot = (caseId, query, apiKey, apiProvider) => api.post(`/cases/${caseId}/ask-copilot`, { query, apiKey, apiProvider });
export const getAuditTrail = () => api.get('/audit-trail');
export const resetDemoData = () => api.post('/reset-demo');

export default api;
