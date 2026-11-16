import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';
import raw from '../data/media.json';

/**
 * MEDIA REGISTRY — every image/video on the site is referenced by id, never by path.
 * To replace a capture: drop the new file in src/assets/media/ and change `src` of ONE entry in
 * src/data/media.json. No component needs to change. The build fails on unknown ids or missing files.
 */
const MediaSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be lowercase-kebab'),
  src: z.string().min(3), // images: path under src/assets/media/. videos: file name under public/media/video/
  kind: z.enum(['gameplay', 'studio-capture', 'render', 'screenshot', 'diagram', 'video']),
  verification: z.enum(['verified', 'provisional', 'replace-me']),
  alt: z.string().min(20, 'alt text must describe the image'),
  caption: z.string().min(10),
  poster: z.string().optional(), // for videos: id of an image entry
  credit: z.string().optional(),
  notes: z.string().optional(), // internal; never rendered
});
export type MediaEntry = z.infer<typeof MediaSchema>;

export const allMedia: MediaEntry[] = z.array(MediaSchema).parse(raw);
const byId = new Map(allMedia.map((m) => [m.id, m]));
if (byId.size !== allMedia.length) throw new Error('media.json contains duplicate ids');

const images = import.meta.glob<ImageMetadata>('/src/assets/media/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

export type ResolvedMedia =
  | { entry: MediaEntry; type: 'image'; image: ImageMetadata }
  | { entry: MediaEntry; type: 'video'; videoSrc: string; poster: ResolvedMedia | null };

export function getMedia(id: string): ResolvedMedia {
  const entry = byId.get(id);
  if (!entry) throw new Error(`Unknown media id "${id}". Add it to src/data/media.json.`);
  if (entry.kind === 'video') {
    return {
      entry,
      type: 'video',
      videoSrc: `/media/video/${entry.src}`,
      poster: entry.poster ? getMedia(entry.poster) : null,
    };
  }
  const image = images[`/src/assets/media/${entry.src}`];
  if (!image) throw new Error(`Media "${id}": file not found at src/assets/media/${entry.src}`);
  return { entry, type: 'image', image };
}

export const kindLabel: Record<MediaEntry['kind'], string> = {
  gameplay: 'Gameplay',
  'studio-capture': 'Studio capture',
  render: 'Render',
  screenshot: 'Screenshot',
  diagram: 'Diagram',
  video: 'Video',
};
