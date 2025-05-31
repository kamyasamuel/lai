import { useLocalStorage } from '../../hooks/useLocalStorage';
export function useChatHistory() {
  return useLocalStorage('https://lawyers.legalaiafrica.com/api/chatMessages', []);
}