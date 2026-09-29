import { api } from "./auth";

export async function sendMessage(message) {
  const response = await api.post("/message", message);
  return response.data.data;
}

export async function getMessages() {
  const response = await api.get("/message");
  return response.data.data || [];
}

export async function getUnreadMessageCount() {
  const response = await api.get("/message/unread-count");
  return response.data.data?.count || 0;
}

export async function markMessageAsRead(messageId) {
  const response = await api.patch(`/message/${messageId}/read`);
  return response.data.data;
}

export async function deleteMessage(messageId) {
  const response = await api.delete(`/message/${messageId}`);
  return response.data;
}
