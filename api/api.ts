import type {
  BadgeDetailResponse,
  CertificateCreatePayload,
  CertificateDetailResponse,
  CreateResponse,
  FetchOptions,
  ListResponse,
  UploadResponse,
  UUIDResponse,
} from '#achievement/config/types.ts';

export const getCertificateList: (params: Record<string, any>, options?: FetchOptions) => Promise<ListResponse> = (params, options = {}) => {
  return useNuxtApp().$apiGateway<ListResponse>('/achievement/api/v1/cms/certificates', {
    ...options,
    params,
    method: 'get',
  });
};

export const getBadgeList: (params: Record<string, any>, options?: FetchOptions) => Promise<ListResponse> = (params, options = {}) => {
  return useNuxtApp().$apiGateway<ListResponse>('/achievement/api/v1/cms/badges', {
    ...options,
    params,
    method: 'get',
  });
};

export const postAddBadge: (body: Record<string, any>, options?: FetchOptions) => Promise<CreateResponse> = (body, options = {}) => {
  return useNuxtApp().$apiGateway<CreateResponse>('/achievement/api/v1/cms/badges', {
    ...options,
    body,
    method: 'post',
  });
};

export const postAddCertificate: (body: Record<string, any>, options?: FetchOptions) => Promise<CreateResponse> = (body, options = {}) => {
  return useNuxtApp().$apiGateway<CreateResponse>('/achievement/api/v1/cms/certificates', {
    ...options,
    body,
    method: 'post',
  });
};

export const postUploadAchievementFile = async (
  file: File,
  key: string,
  options: FetchOptions = {},
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);

  return useNuxtApp().$apiGateway<UploadResponse>('/achievement/api/v1/upload', {
    ...options,
    body: formData,
    method: 'post',
  });
};

export const getBadgeDetail = async (
  id: number,
  options: FetchOptions = {},
): Promise<BadgeDetailResponse> => {
  return useNuxtApp().$apiGateway<BadgeDetailResponse>(`/achievement/api/v1/cms/badges/${id}`, {
    ...options,
    method: 'get',
  });
};

export const patchEditBadge = async (
  id: number,
  body: Record<string, any>,
  options: FetchOptions = {},
): Promise<CreateResponse> => {
  return useNuxtApp().$apiGateway<CreateResponse>(`/achievement/api/v1/cms/badges/${id}`, {
    ...options,
    body,
    method: 'patch',
  });
};

export const deleteCertificate = async (
  id: number,
  options: FetchOptions = {},
): Promise<CreateResponse> => {
  return useNuxtApp().$apiGateway<CreateResponse>(`/achievement/api/v1/cms/certificates/${id}`, {
    ...options,
    method: 'delete',
  });
};

export const deleteBadge = async (
  id: number,
  options: FetchOptions = {},
): Promise<CreateResponse> => {
  return useNuxtApp().$apiGateway<CreateResponse>(`/achievement/api/v1/cms/badges/${id}`, {
    ...options,
    method: 'delete',
  });
};

export const getSerialNumberUUID = async (
  options: FetchOptions = {},
): Promise<UUIDResponse> => {
  return useNuxtApp().$apiGateway<UUIDResponse>('/achievement/api/v1/cms/setup/uuid', {
    ...options,
    method: 'get',
  });
};

export const getCertificateDetail = async (
  id: number,
  options: FetchOptions = {},
): Promise<CertificateDetailResponse> => {
  return useNuxtApp().$apiGateway<CertificateDetailResponse>(`/achievement/api/v1/cms/certificates/${id}`, {
    ...options,
    method: 'get',
  });
};

export const patchEditCertificate = async (
  id: number,
  body: CertificateCreatePayload,
  options: FetchOptions = {},
): Promise<CreateResponse> => {
  return useNuxtApp().$apiGateway<CreateResponse>(`/achievement/api/v1/cms/certificates/${id}`, {
    ...options,
    body,
    method: 'patch',
  });
};
