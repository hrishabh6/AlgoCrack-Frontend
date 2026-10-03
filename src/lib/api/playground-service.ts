import { ENDPOINTS } from "../constants";
import { apiClient } from "../api-client";
import type {
  LanguageDescriptor,
  PlaygroundCreateRequest,
  PlaygroundDetail,
  PlaygroundPageResponse,
  PlaygroundRunRequest,
  PlaygroundRunResponse,
  PlaygroundUpdateRequest,
} from "@/types/playground";

const base = ENDPOINTS.PLAYGROUNDS;

export async function listPlaygrounds(page = 0, size = 20): Promise<PlaygroundPageResponse> {
  return apiClient.get<PlaygroundPageResponse>(`${base}?page=${page}&size=${size}`);
}

export async function getPlayground(id: number): Promise<PlaygroundDetail> {
  return apiClient.get<PlaygroundDetail>(`${base}/${id}`);
}

export async function createPlayground(body: PlaygroundCreateRequest): Promise<PlaygroundDetail> {
  return apiClient.post<PlaygroundDetail>(base, body);
}

export async function updatePlayground(id: number, body: PlaygroundUpdateRequest): Promise<PlaygroundDetail> {
  return apiClient.put<PlaygroundDetail>(`${base}/${id}`, body);
}

export async function deletePlayground(id: number): Promise<void> {
  await apiClient.delete(`${base}/${id}`);
}

export async function runPlayground(body: PlaygroundRunRequest): Promise<PlaygroundRunResponse> {
  return apiClient.post<PlaygroundRunResponse>(`${base}/run`, body);
}

export async function getPlaygroundLanguages(): Promise<LanguageDescriptor[]> {
  return apiClient.get<LanguageDescriptor[]>(`${base}/languages`);
}
