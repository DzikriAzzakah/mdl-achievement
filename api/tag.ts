import type { FetchOptions, ICreateResponse, IOrgConfigs } from '#audio/config/types.ts';
import { COOKIE_ORG_CONFIGS } from '~/layers/auth/config/constants';

export const patchTag = (audioId: number | string | undefined, payload: Record<string, any>, options: FetchOptions = {}): Promise<ICreateResponse> => {
  const { $api } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;

  return $api<ICreateResponse>(`/cms/v2/programs/${orgConfigs.id}/content-types/AUDIO/contents/${audioId}/tags`, {
    ...options,
    body: payload,
    method: 'patch',
  });
};

export const patchTagPayload = (payload: Record<string, any>, options: FetchOptions = {}): Promise<ICreateResponse> => {
  const { $api } = useNuxtApp();
  const orgConfigs = useCookie(COOKIE_ORG_CONFIGS).value as IOrgConfigs;
  const contentType = payload.contentType || 'AUDIO';
  const body = payload.tags !== undefined ? { tags: payload.tags } : payload;

  return $api<ICreateResponse>(`/cms/v2/programs/${orgConfigs.id}/content-types/${contentType}/contents/${payload.id}/tags`, {
    ...options,
    body,
    method: 'patch',
  });
};
