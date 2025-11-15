// src/services/auth.service.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:5239/api/Authentication";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const authService = {
  // 🔹 LOGIN - Nhận { email, password }
  login: async (data: { email: string; password: string }) => {
    try {
      const res = await authApi.post("/login", data);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (error: any) {
      console.error("❌ Login API Error:", error.response?.data || error);
      throw error.response?.data || { message: "Lỗi đăng nhập!" };
    }
  },

  // 🔹 REGISTER (Backend dùng [FromForm])
  register: async (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const res = await authApi.post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  // 🔹 FORGOT PASSWORD
  forgotPassword: async (email: string) =>
    (await authApi.post(`/forgot-password?email=${email}`)).data,

  // 🔹 CHANGE PASSWORD
  changePassword: async (data: any) => {
    const token = localStorage.getItem("token");
    return (
      await authApi.put("/change-password", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  },

  // 🔹 LOGOUT
  logout: async () => {
    const token = localStorage.getItem("token");
    try {
      await authApi.post(
        "/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } finally {
      localStorage.removeItem("token");
    }
  },

  getToken: () => localStorage.getItem("token"),
  isAuthenticated: () => !!localStorage.getItem("token"),
};

export default authService;
