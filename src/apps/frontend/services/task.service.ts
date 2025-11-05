import APIService from 'frontend/services/api.service';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  PaginatedTasksResponse,
  AccessToken,
  ApiResponse,
} from 'frontend/types';

export default class TaskService extends APIService {
  getTasks = async (
    userAccessToken: AccessToken,
    page: number = 1,
    size: number = 10,
  ): Promise<ApiResponse<PaginatedTasksResponse>> =>
    this.apiClient.get(
      `/accounts/${userAccessToken.accountId}/tasks?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

  getTask = async (
    userAccessToken: AccessToken,
    taskId: string,
  ): Promise<ApiResponse<Task>> =>
    this.apiClient.get(
      `/accounts/${userAccessToken.accountId}/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

  createTask = async (
    userAccessToken: AccessToken,
    taskData: CreateTaskRequest,
  ): Promise<ApiResponse<Task>> =>
    this.apiClient.post(
      `/accounts/${userAccessToken.accountId}/tasks`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

  updateTask = async (
    userAccessToken: AccessToken,
    taskId: string,
    taskData: UpdateTaskRequest,
  ): Promise<ApiResponse<Task>> =>
    this.apiClient.patch(
      `/accounts/${userAccessToken.accountId}/tasks/${taskId}`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );

  deleteTask = async (
    userAccessToken: AccessToken,
    taskId: string,
  ): Promise<ApiResponse<void>> =>
    this.apiClient.delete(
      `/accounts/${userAccessToken.accountId}/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken.token}`,
        },
      },
    );
}
