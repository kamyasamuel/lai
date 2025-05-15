import { useLocalStorage } from '../../hooks/useLocalStorage';
export function useChatHistory() {
  return useLocalStorage('chatMessages', []);
}