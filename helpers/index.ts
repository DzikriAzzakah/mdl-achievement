export function buildMediaUrl(url?: string | null): string {
  if (url == null || url === '') {
    return '';
  }
  return url;
}

export function normalizePlaylistContents(contents: any[] = []) {
  return contents.map((item: any) => ({
    ...item,
    id: Number(item?.id ?? item?.content_id),
    status_enum: item?.status_enum ?? (item?.is_published ? 'publish' : 'draft'),
    accessibility_type: item?.accessibility_type
      ? String(item.accessibility_type).toUpperCase()
      : item?.accessibility_type,
  }));
}
