import axios from "axios";

const API_BASE = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ztg_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
};

export const accessApi = {
  accessSensitive: () => api.get("/api/access-sensitive"),
};

export const socApi = {
  getAlerts: () => api.get("/api/soc/alerts"),
  updateAlert: (id: string, status: string) =>
    api.put(`/api/soc/alerts/${id}`, { status }),
  getLogs: () => api.get("/api/soc/logs"),
};

export default api;
