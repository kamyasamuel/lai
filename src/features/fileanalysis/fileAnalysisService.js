import API_BASE_URL from '../../config';

export async function analyzeFileAPI(formData) {
  const res = await fetch(`${API_BASE_URL}/analyze/file`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}