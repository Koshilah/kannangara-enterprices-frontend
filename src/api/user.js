import { api } from "./auth";

export async function getEmployees() {
  const response = await api.get("/user/employees");
  return response.data.data || [];
}

export async function createEmployee(employee) {
  const response = await api.post("/user/employees", employee);
  return response.data.data;
}

export async function updateEmployeeRole(employeeID, role) {
  const response = await api.patch(`/user/employees/${employeeID}/role`, {
    role,
  });
  return response.data.data;
}

export async function demoteEmployee(employeeID) {
  const response = await api.patch(`/user/employees/${employeeID}/demote`, {});
  return response.data;
}

export async function getProfile() {
  const response = await api.get("/user/profile");
  return response.data.data;
}

export async function updateProfile(profile) {
  const response = await api.patch("/user/profile", profile);
  return response.data.data;
}

export async function updatePassword(passwords) {
  const response = await api.patch("/user/profile/password", passwords);
  return response.data;
}
