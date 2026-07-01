import { useState, useCallback, useRef } from 'react';
import { fetchAutocomplete } from '@/api/mtgch';
import type { AutoCompleteItem } from '@/types/card';

interface UseAutocompleteReturn {
  options: { value: string; label: string; item: AutoCompleteItem }[];
  search: (query: string) => Promise<void>;
  loading: boolean;
}

/** 自动补全 hook —— 防抖 + 缓存 */
export function useAutocomplete(): UseAutocompleteReturn {
  const [options, setOptions] = useState<
    { value: string; label: string; item: AutoCompleteItem }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, AutoCompleteItem[]>>(new Map());

  const search = useCallback(async (query: string) => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (query.length < 2) {
      setOptions([]);
      return;
    }

    // 检查缓存
    const cached = cacheRef.current.get(query);
    if (cached) {
      setOptions(
        cached.map((item) => ({
          value: item.name,
          label: `${item.display_name || item.name} [${item.set}]`,
          item,
        }))
      );
      return;
    }

    // 防抖 300ms
    return new Promise<void>((resolve) => {
      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const data = await fetchAutocomplete(query);
          const items = data.items || [];
          // 缓存结果
          cacheRef.current.set(query, items);
          setOptions(
            items.map((item) => ({
              value: item.name,
              label: `${item.display_name || item.name} [${item.set}]`,
              item,
            }))
          );
        } catch {
          setOptions([]);
        } finally {
          setLoading(false);
          resolve();
        }
      }, 300);
    });
  }, []);

  return { options, search, loading };
}
