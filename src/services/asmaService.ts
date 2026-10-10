import { ASMA_AL_HUSNA, AsmaName } from '../data/asmaAlHusna';

export async function fetchAsmaAlHusna(): Promise<AsmaName[]> {
  try {
    // Try public API if online, with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://api.aladhan.com/v1/asmaAlHusna', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data) && json.data.length === 99) {
        // Merge with our rich local descriptions and categories
        return ASMA_AL_HUSNA.map((local, idx) => {
          const apiItem = json.data[idx];
          return {
            ...local,
            transliteration: apiItem.en?.meaning ? apiItem.en.meaning : local.transliteration,
          };
        });
      }
    }
  } catch (e) {
    // Graceful fallback to embedded comprehensive data
  }

  return ASMA_AL_HUSNA;
}

export function searchAsma(list: AsmaName[], query: string, category: string = 'all'): AsmaName[] {
  const q = query.trim().toLowerCase();
  return list.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesQuery =
      !q ||
      item.name.includes(q) ||
      item.transliteration.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      String(item.number) === q;

    return matchesCategory && matchesQuery;
  });
}
