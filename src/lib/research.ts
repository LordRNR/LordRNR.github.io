// Research datasets are looked up by project id: src/data/research/<project-id>.json
// A research-type project without a dataset falls back to the generic layout.
const files = import.meta.glob('../data/research/*.json', { eager: true, import: 'default' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getResearch(id: string): any | null {
  return (files[`../data/research/${id}.json`] as unknown) ?? null;
}
