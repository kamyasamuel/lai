import API_BASE_URL from '../../config';

export async function uploadDocumentAPI(title, formData) {
    const slug = title.toLowerCase().replace(/\s+/g,'-');
    const res = await fetch(`${API_BASE_URL}/analyze/${slug}`, {
      method: 'POST', body: formData
    });
    return res.json();
  }