import type { FetchOptions, ICreateResponse, IGetLandingSectionDetail, IGetListCompetency, IGetListResponse, IOrgConfigs } from '#audio/config/types.ts';
import { COOKIE_ORG_CONFIGS } from '~/layers/auth/config/constants';

const getUtilityBaseUrl = () => {
  try {
    return new URL('/utility', useRuntimeConfig().public?.gatewayApiBaseUrl).toString();
  }
  catch {
    return '';
  }
};

export const getAudioList: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/audios`, {
    ...(options || {}),
    params,
    method: 'get',
  });
};

export const deleteAudioList: (audioId: number, options?: FetchOptions) => Promise<IGetListResponse> = (audioId, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/audios/${audioId}`, {
    ...(options || {}),
    method: 'delete',
  });
};

export const getAudioDetail: (id: number | string, options?: FetchOptions) => Promise<IGetListResponse> = (id, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/audios/${id}`, {
    ...(options || {}),
    method: 'get',
  });
};

export const getSelectedCompetency: (id: number | string, options?: FetchOptions) => Promise<IGetListResponse> = (id, options = {}) => {
  const { $api } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;

  return $api<IGetListResponse>(`cms/v2/programs/${orgConfigs.id}/content-types/AUDIO/contents/${id}/competencies-tree`, {
    ...(options || {}),
    method: 'get',
  });
};

export const getSelectedTag: (idOrPayload: number | string | Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (idOrPayload, options = {}) => {
  const { $api } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;
  const id = typeof idOrPayload === 'object' ? idOrPayload?.id : idOrPayload;
  const contentType = typeof idOrPayload === 'object' ? (idOrPayload?.contentType || 'AUDIO') : 'AUDIO';

  return $api<IGetListResponse>(`/cms/v2/programs/${orgConfigs.id}/content-types/${contentType}/contents/${id}/tags`, {
    ...(options || {}),
    method: 'get',
  });
};

export const patchEditAudio: (audioId: number | string | undefined, payload: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (audioId, payload, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`knowledge/cms/v1/audios/${audioId}`, {
    ...(options || {}),
    body: payload,
    method: 'patch',
  });
};

export const togglePublishAudio: (audioId: number | string, options?: FetchOptions) => Promise<ICreateResponse> = (audioId, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`knowledge/cms/v1/audios/${audioId}/toggle-publish`, {
    ...(options || {}),
    method: 'patch',
  });
};

export const patchCompetencyId: (audioId: number | string | undefined, payload: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (audioId, payload, options = {}) => {
  const { $api } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;

  return $api<ICreateResponse>(`/cms/v2/programs/${orgConfigs.id}/content-types/AUDIO/contents/${audioId}/competencies`, {
    ...(options || {}),
    body: payload,
    method: 'patch',
  });
};

export const postAddAudio: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/audios`, {
    ...(options || {}),
    body,
    method: 'post',
  });
};

export const getTagOptions: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  const { $api } = useNuxtApp();

  return $api<IGetListResponse>(`/v1/tags/admin-generated`, {
    ...(options || {}),
    params,
    method: 'get',
    baseURL: getUtilityBaseUrl(),
  });
};

export const getTagOptionsWithId: (params?: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  const { $api } = useNuxtApp();

  return $api<IGetListResponse>(`/v1/tags/admin-generated`, {
    ...(options || {}),
    params,
    method: 'get',
    baseURL: getUtilityBaseUrl(),
  });
};

export const getCompetencyTree: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListCompetency> = (params, options = {}) => {
  const { $api } = useNuxtApp();

  return $api<IGetListCompetency>(`directory-competencies/v2/competencies-tree`, {
    ...(options || {}),
    params,
    method: 'get',
  });
};

export const getLevelList: () => Promise<IGetListResponse> = (options = {}) => {
  const { $api } = useNuxtApp();

  return $api<IGetListResponse>('levels', {
    ...(options || {}),
    method: 'get',
  });
};

export const getKeyBehaviours: (payload: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (payload, options = {}) => {
  const { $api } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;
  const { competencyId, levelId } = payload;

  return $api<IGetListResponse>(`cms/v1/programs/${orgConfigs.id}/competencies/${competencyId}/levels/${levelId}/behaviours`, {
    ...(options || {}),
    method: 'get',
  });
};

export const getAudioListNotInPlaylist: (params: Record<string, any>, id: number | string, options?: FetchOptions) => Promise<IGetListResponse> = (params, id, options = {}) => {
  const { $apiGateway } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/platforms/${orgConfigs?.id}/playlists/${id}/contents-not-in-playlist`, {
    ...(options || {}),
    params,
    method: 'get',
  });
};

export const getPlaylist: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/playlists`, {
    ...(options || {}),
    params,
    method: 'get',
  });
};

export const postCreatePlaylist: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`knowledge/cms/v1/playlists`, {
    ...(options || {}),
    body,
    method: 'post',
  });
};

export const postCreatePlaylistContent: (body: Record<string, any>, playlistId: number, options?: FetchOptions) => Promise<ICreateResponse> = (body, playlistId, options = {}) => {
  const { $apiGateway } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;

  return $apiGateway<ICreateResponse>(`knowledge/cms/v1/platforms/${orgConfigs.id}/playlists/${playlistId}/contents`, {
    ...(options || {}),
    body,
    method: 'post',
  });
};

export const getPlaylistContent: (playlistId: number, options?: FetchOptions) => Promise<IGetListResponse> = (playlistId, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/playlists/${playlistId}/contents`, {
    method: 'get',
    ...(options || {}),
    params: {
      page: 1,
      limit: 10,
      ...(options?.params || {}),
    },
  });
};

export const deletePlaylist: (playlistId: number, options?: FetchOptions) => Promise<IGetListResponse> = (playlistId, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/playlists/${playlistId}`, {
    ...(options || {}),
    method: 'delete',
  });
};

export const deletePlaylistContent: (payload: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (payload, options = {}) => {
  const { $apiGateway } = useNuxtApp();
  const { playlistId, contentId } = payload;
  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/playlists/${playlistId}/contents/${contentId}`, {
    ...(options || {}),
    method: 'delete',
  });
};

export const getDetailPlaylist: (id: number | string, options?: FetchOptions) => Promise<IGetListResponse> = (id, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`knowledge/cms/v1/playlists/${id}`, {
    ...(options || {}),
    method: 'get',
  });
};

export const editPlaylist: (playlistId: number | string | undefined, payload: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (playlistId, payload, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`knowledge/cms/v1/playlists/${playlistId}`, {
    ...(options || {}),
    body: payload,
    method: 'patch',
  });
};

export const getSectionTypeOptions: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`branding/cms/v1/content-types?paginate=false&filter[exclude]=video`, {
    ...(options || {}),
    params,
    method: 'get',
  });
};

export const postCreateSectionLanding: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`branding/cms/v1/page-sections`, {
    ...(options || {}),
    body,
    method: 'post',
  });
};

export const getSectionLandingList: (params: Record<string, any>, options?: FetchOptions) => Promise<IGetListResponse> = (params, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`branding/cms/v1/pages/audio/sections`, {
    ...(options || {}),
    params,
    method: 'get',
  });
};

export const deleteSectionLandingList: (sectionId: number, options?: FetchOptions) => Promise<IGetListResponse> = (sectionId, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`branding/cms/v1/sections/${sectionId}`, {
    ...(options || {}),
    method: 'delete',
  });
};

export const postReorderSection: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`branding/cms/v1/sections/reorder`, {
    ...(options || {}),
    body,
    method: 'post',
  });
};

export const getDetailLandingSection: (id: number | string, options?: FetchOptions) => Promise<IGetListResponse> = (id, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetListResponse>(`branding/cms/v1/page-sections/${id}`, {
    ...(options || {}),
    method: 'get',
  });
};

export const editLandingSection: (sectionId: number | string | undefined, payload: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (sectionId, payload, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`branding/cms/v1/page-sections/${sectionId}`, {
    ...(options || {}),
    body: payload,
    method: 'put',
  });
};

export const postCreateSectionLandingV2: (body: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (body, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>('branding/cms/v1/pages/audio/sections', {
    ...(options || {}),
    body,
    method: 'post',
  });
};

export const editLandingSectionV2: (sectionId: number | string | undefined, payload: Record<string, any>, options?: FetchOptions) => Promise<ICreateResponse> = (sectionId, payload, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<ICreateResponse>(`branding/cms/v1/sections/${sectionId}`, {
    ...(options || {}),
    body: payload,
    method: 'put',
  });
};

export const getDetailLandingSectionV2: (id: number | string, options?: FetchOptions) => Promise<IGetLandingSectionDetail> = (id, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway<IGetLandingSectionDetail>(`branding/cms/v1/sections/${id}`, {
    ...(options || {}),
    method: 'get',
  });
};

export const deleteSectionItem: (id: number, options?: FetchOptions) => Promise<any> = (id, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway(`branding/cms/v1/section-items/${id}`, {
    ...(options || {}),
    method: 'delete',
  });
};

export const addSectionItem: (payload: { section_id: number; content_type: string; content_id: number; }, options?: FetchOptions) => Promise<any> = (payload, options = {}) => {
  const { $apiGateway } = useNuxtApp();

  return $apiGateway(`branding/cms/v1/section-items`, {
    ...(options || {}),
    body: payload,
    method: 'post',
  });
};
