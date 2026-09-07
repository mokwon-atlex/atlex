// Raw user API calls. Return the unwrapped response as-is.

import { apiClient } from '@/lib/api/client';

// GET /users/{userId}
export function getUser(userId) {
  return apiClient.get(`/users/${userId}`);
}

// PUT /users/{userId}
export function updateUser(userId, body) {
  return apiClient.put(`/users/${userId}`, body);
}

// DELETE /users/{userId}
export function deleteUser(userId) {
  return apiClient.delete(`/users/${userId}`);
}

// PATCH /users/{userId}/password
export function updateUserPassword(userId, currentPassword, newPassword) {
  return apiClient.patch(`/users/${userId}/password`, {
    currentPassword,
    newPassword,
  });
}

// POST /users/email/check
export function checkUserEmail(email) {
  return apiClient.post('/users/email/check', { email });
}

// GET /users/{userId}/categories
export function getUserBlogCategories(userId, limit = 10, cursor = 0) {
  return apiClient.get(`/users/${userId}/categories`, { params: { limit, cursor } });
}

// POST /users/{userId}/categories
export function createUserBlogCategory(userId, name) {
  return apiClient.post(`/users/${userId}/categories`, { name });
}

// PATCH /users/{userId}/categories/{categoryId}
export function updateUserBlogCategory(userId, categoryId, name) {
  return apiClient.patch(`/users/${userId}/categories/${categoryId}`, { name });
}

// DELETE /users/{userId}/categories/{categoryId}
export function deleteUserBlogCategory(userId, categoryId) {
  return apiClient.delete(`/users/${userId}/categories/${categoryId}`);
}
