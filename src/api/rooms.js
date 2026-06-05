// Hardcoded production URL fallback to prevent local leakage in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://wonderfloor-dashboard.vercel.app';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchRooms = async () => {
  const response = await fetch(`${API_BASE_URL}/rooms`, { method: 'GET' });
  if (!response.ok) throw new Error('Failed to fetch rooms from the server.');
  return response.json();
};

export const uploadRoom = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/upload/room`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload room.');
  }
  return response.json();
};