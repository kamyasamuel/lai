export async function uploadDocumentAPI(title, formData) {
    const slug = title.toLowerCase().replace(/\s+/g,'-');
    const res = await fetch(`http://localhost:8888/analyze/${slug}`, {
      method: 'POST', body: formData
    });
    return res.json();
  }