import api from "./axiosInstance";

export const authApi = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },
  register: async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get("/auth/profile");
    return data;
  },
  updatePreferences: async (preferences) => {
    const { data } = await api.put("/auth/preferences", preferences);
    return data;
  },
};
