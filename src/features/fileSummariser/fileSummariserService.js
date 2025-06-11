import API_BASE_URL from '../../config';

export async function summariseFileAPI(formData) {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
