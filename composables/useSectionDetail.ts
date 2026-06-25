import type { ISectionItem } from '#audio/config/types.ts';
import { getAudioDetail, getAudioList, getDetailPlaylist, getPlaylistContent } from '#audio/api/api.ts';

export interface IEnrichedContentItem {
  id: number | string;
  content_id: number | string;
  content_type: string;
  title: string;
  cover_url: string;
  thumbnail_url: string;
  slug: string;
  created_at: string;
  updated_at: string;
  duration_in_seconds?: number;
  is_published?: boolean;
  accessibility_type?: string;
  section_item_id: number;
}

function mapDetailToContentItem(
  sectionItem: ISectionItem,
  detail: Record<string, any> | null | undefined,
): IEnrichedContentItem {
  return {
    id: sectionItem.content_id,
    content_id: sectionItem.content_id,
    content_type: sectionItem.content_type,
    title: detail?.title || '',
    cover_url: detail?.cover_url || '',
    thumbnail_url: detail?.cover_url || '',
    slug: detail?.slug || '',
    created_at: detail?.created_at || '',
    updated_at: detail?.updated_at || '',
    duration_in_seconds: detail?.duration_in_seconds,
    is_published: detail?.is_published,
    accessibility_type: detail?.accessibility_type,
    section_item_id: sectionItem.id,
  };
}

/**
 * Master mode: no source_type, fetch audio detail for each content_id in parallel.
 */
async function enrichMasterSectionItems(sectionItems: ISectionItem[]): Promise<IEnrichedContentItem[]> {
  const contentIds = sectionItems.map(item => item.content_id);

  const results = await Promise.allSettled(
    contentIds.map(id => getAudioDetail(id)),
  );

  return sectionItems.map((item, index) => {
    const result = results[index];
    const audioData = result.status === 'fulfilled' ? result.value?.data : null;
    return mapDetailToContentItem(item, audioData);
  });
}

/**
 * Playlist mode: fetch all playlist contents (paginate=false), cross-reference with section_items.
 */
async function enrichPlaylistSectionItems(
  sectionItems: ISectionItem[],
  playlistId: number,
): Promise<{
    items: IEnrichedContentItem[];
    playlistInfo: { id: number; title: string; } | null;
  }> {
  const [playlistResponse, contentsResponse] = await Promise.allSettled([
    getDetailPlaylist(playlistId),
    getPlaylistContent(playlistId, { params: { paginate: 'false' } }),
  ]);

  const playlistDetail = playlistResponse.status === 'fulfilled' ? playlistResponse.value?.data : null;
  const playlistContents = contentsResponse.status === 'fulfilled'
    ? (contentsResponse.value?.data?.contents || [])
    : [];

  const contentMap = new Map<string, Record<string, any>>();
  playlistContents.forEach((item: any) => {
    const key = String(item.content_id || item.id);
    contentMap.set(key, item);
  });

  const items = sectionItems.map((item) => {
    const detail = contentMap.get(String(item.content_id));
    return mapDetailToContentItem(item, detail);
  });

  const playlistInfo = playlistDetail
    ? { id: playlistId, title: playlistDetail.title || '' }
    : null;

  return { items, playlistInfo };
}

/**
 * Tag mode: fetch all audio filtered by tag (paginate=false), cross-reference with section_items.
 */
async function enrichTagSectionItems(
  sectionItems: ISectionItem[],
  tagId: number,
): Promise<{
    items: IEnrichedContentItem[];
    tagInfo: { id: number; title: string; } | null;
  }> {
  const response = await getAudioList({
    'paginate': 'false',
    'filter[tag_ids]': tagId,
  });

  const audioContents = response?.data?.contents || response?.data || [];

  const contentMap = new Map<string, Record<string, any>>();
  audioContents.forEach((item: any) => {
    const key = String(item.id || item.content_id);
    contentMap.set(key, item);
  });

  const items = sectionItems.map((item) => {
    const detail = contentMap.get(String(item.content_id));
    return mapDetailToContentItem(item, detail);
  });

  // Infer tag name from the first content's tags if available
  let tagTitle = '';
  for (const content of audioContents) {
    const tags = content?.tags || [];
    const found = tags.find((t: any) => Number(t?.tag_id) === tagId || Number(t?.id) === tagId);
    if (found) {
      tagTitle = found.tag || found.title || found.label || '';
      break;
    }
  }

  const tagInfo = { id: tagId, title: tagTitle };

  return { items, tagInfo };
}

export function useSectionDetail() {
  return {
    enrichMasterSectionItems,
    enrichPlaylistSectionItems,
    enrichTagSectionItems,
  };
}
