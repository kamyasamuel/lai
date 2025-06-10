import { useLocalStorage } from '../../hooks/useLocalStorage';

export function useQueryHistory(queryType) {
  const historyKey = `queryHistory_${queryType}`;
  return useLocalStorage(historyKey, []);
} 