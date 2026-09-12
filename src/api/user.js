import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

function authConfig() {
  return {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
  };
}

export async function getEmployees() {
  const response = await api.get("/user/employees", authConfig());
  return response.data.data || [];
}

export async function createEmployee(employee) {
  const response = await api.post("/user/employees", employee, authConfig());
  return response.data.data;
}

export async function updateEmployeeRole(employeeID, role) {
  const response = await api.patch(
    `/user/employees/${employeeID}/role`,
    { role },
    authConfig(),
  );
  return response.data.data;
}

export async function demoteEmployee(employeeID) {
  const response = await api.patch(
    `/user/employees/${employeeID}/demote`,
    {},
    authConfig(),
  );
  return response.data;
}

export async function getProfile() {
  const response = await api.get("/user/profile", authConfig());
  return response.data.data;
}

export async function updateProfile(profile) {
  const response = await api.patch("/user/profile", profile, authConfig());
  return response.data.data;
}

export async function updatePassword(passwords) {
  const response = await api.patch("/user/profile/password", passwords, authConfig());
  return response.data;
}
