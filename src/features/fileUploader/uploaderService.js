export async function uploadDocumentAPI(title, formData) {
    const slug = title.toLowerCase().replace(/\s+/g,'-');
    const res = await fetch(`https://lawyers.legalaiafrica.com/analyze/${slug}`, {
      method: 'POST', body: formData
    });
    return res.json();
  }