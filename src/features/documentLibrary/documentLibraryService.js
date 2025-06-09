import API_BASE_URL from '../../config';

export async function fetchDocumentsAPI(searchTerm = '') {
  const url = new URL(`${API_BASE_URL}/documents`);
  if (searchTerm) {
    url.searchParams.append('search', searchTerm);
  }
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
  }
  return response.json();
} 