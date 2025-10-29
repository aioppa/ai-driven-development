import { GalleryImage, ImageMetadata } from '@/lib/types';

type LocalGalleryItem = {
  id: string;
  url: string;
  thumbnailUrl: string;
  prompt: string;
  styleId: string;
  createdAt: string; // ISO string
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  isPublic: boolean;
  updatedAt?: string; // ISO string
};

const STORAGE_KEY = 'aipixels.local.gallery.v1';

function readStore(): LocalGalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeStore(items: LocalGalleryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function addGenerated(images: Array<{ id: string; url: string; thumbnailUrl: string; prompt: string; styleId: string; createdAt: Date | string }>) {
  const items = readStore();
  const now = new Date().toISOString();
  const map = new Map(items.map(i => [i.id, i] as const));
  for (const img of images) {
    if (!map.has(img.id)) {
      items.unshift({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnailUrl || img.url,
        prompt: img.prompt,
        styleId: img.styleId,
        createdAt: (img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt) || now,
        isPublic: false,
        updatedAt: now,
      });
    }
  }
  writeStore(items.slice(0, 200)); // 간단한 상한
}

export function updateMetadata(id: string, metadata: ImageMetadata) {
  const items = readStore();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  items[idx] = {
    ...items[idx],
    title: metadata.title,
    description: metadata.description,
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    category: metadata.category,
    updatedAt: new Date().toISOString(),
  };
  writeStore(items);
}

export function setVisibility(id: string, isPublic: boolean) {
  const items = readStore();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], isPublic, updatedAt: new Date().toISOString() };
  writeStore(items);
}

export function list(tab: 'private' | 'public', page = 1, limit = 12): { data: GalleryImage[]; hasMore: boolean; total: number } {
  const items = readStore();
  const filtered = items.filter(i => (tab === 'public' ? i.isPublic : !i.isPublic));
  const sorted = filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const start = (page - 1) * limit;
  const slice = sorted.slice(start, start + limit);
  const mapped: GalleryImage[] = slice.map(i => ({
    id: i.id,
    title: i.title || '',
    description: i.description || '',
    tags: i.tags || [],
    category: i.category || 'other',
    thumbnailUrl: i.thumbnailUrl,
    imageUrl: i.url,
    isPublic: i.isPublic,
    createdAt: new Date(i.createdAt),
    updatedAt: new Date(i.updatedAt || i.createdAt),
    stats: { views: 0, likes: 0, comments: 0 },
  }));
  return { data: mapped, hasMore: start + slice.length < sorted.length, total: filtered.length };
}


