import api from "./axiosInstance";

export const notesApi = {
  getNotes: async (params) => {
    const { data } = await api.get("/notes", { params });
    return data;
  },
  getNoteById: async (id) => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  },
  createNote: async (payload) => {
    const { data } = await api.post("/notes", payload);
    return data;
  },
  updateNote: async (id, payload) => {
    const { data } = await api.put(`/notes/${id}`, payload);
    return data;
  },
  deleteNote: async (id) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data;
  },
  getNoteVersions: async (id) => {
    const { data } = await api.get(`/notes/${id}/versions`);
    return data;
  },
  reorderNotes: async (orderedIds) => {
    const { data } = await api.post("/notes/reorder", { orderedIds });
    return data;
  },
  getTags: async () => {
    const { data } = await api.get("/notes/tags");
    return data;
  },
};
