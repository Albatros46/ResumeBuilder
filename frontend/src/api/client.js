import axios from 'axios';

export const TOKEN_KEY = 'rb_token';

// Vite proxy sayesinde ayni origin kullanilir; farkli bir backend icin VITE_API_URL tanimlayin.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Suresi dolmus/gecersiz token: oturumu kapat ve giris sayfasina yonlendir
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Bir hata oluştu.') {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join(' ');
  }
  if (data?.message) return data.message;
  if (!error?.response) return 'Sunucuya ulaşılamıyor. Backend çalışıyor mu?';
  return fallback;
}

export const authApi = {
  register: (body) => api.post('/api/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/api/auth/login', body).then((r) => r.data),
  verifyEmail: (token) => api.get('/api/auth/verify-email', { params: { token } }).then((r) => r.data),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }).then((r) => r.data),
  profile: () => api.get('/api/auth/profile').then((r) => r.data),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/api/auth/upload-image', form).then((r) => r.data.imageUrl);
  },
};

export const resumeApi = {
  list: () => api.get('/api/resumes').then((r) => r.data),
  get: (id) => api.get(`/api/resumes/${id}`).then((r) => r.data),
  create: (title) => api.post('/api/resumes', { title }).then((r) => r.data),
  update: (id, resume) => api.put(`/api/resumes/${id}`, resume).then((r) => r.data),
  remove: (id) => api.delete(`/api/resumes/${id}`),
};

export default api;
