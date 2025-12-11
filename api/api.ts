import type { FetchOptions, IAchievementUploadResponse, ICreateResponse, IGetListResponse } from '#achievement/config/types.ts';

export interface IBadgeDetailResponse {
  success?: boolean;
  message?: string;
  status_code?: number;
  client_code?: string;
  server_code?: string;
  data?: {
    id: number;
    title: string;
    type?: string;
    url?: string;
  };
}

export const getCertificateList: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  return useNuxtApp().$apiGateway<IGetListResponse>('/achievement/api/v1/cms/certificates', {
    ...options,
    params,
    method: 'get',
  });
};

export const getBadgeList: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  return useNuxtApp().$apiGateway<IGetListResponse>('/achievement/api/v1/cms/badges', {
    ...options,
    params,
    method: 'get',
  });
};

export const postAddBadge: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  return useNuxtApp().$apiGateway<ICreateResponse>('/achievement/api/v1/cms/badges', {
    ...options,
    body,
    method: 'post',
  });
};

export const postAddCertificate: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  return useNuxtApp().$apiGateway<ICreateResponse>('/achievement/api/v1/cms/certificates/', {
    ...options,
    body,
    method: 'post',
  });
};

export const postUploadAchievementFile = async (
  file: File,
  key: string,
  options: FetchOptions = {},
): Promise<IAchievementUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);

  return useNuxtApp().$apiGateway<IAchievementUploadResponse>('/achievement/api/v1/upload', {
    ...options,
    body: formData,
    method: 'post',
  });
};

export const getBadgeDetail = async (
  id: number,
  options: FetchOptions = {},
): Promise<IBadgeDetailResponse> => {
  return useNuxtApp().$apiGateway<IBadgeDetailResponse>(`/achievement/api/v1/cms/badges/${id}`, {
    ...options,
    method: 'get',
  });
};

export const patchEditBadge = async (
  id: number,
  body: Record<string, any>,
  options: FetchOptions = {},
): Promise<ICreateResponse> => {
  return useNuxtApp().$apiGateway<ICreateResponse>(`/achievement/api/v1/cms/badges/${id}`, {
    ...options,
    body,
    method: 'patch',
  });
};
