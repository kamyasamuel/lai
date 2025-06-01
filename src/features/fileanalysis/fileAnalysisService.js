export async function analyzeFileAPI(formData) {
  const res = await fetch('https://lawyers.legalaiafrica.com/api/analyze', {
    method: 'POST',
    body: formData
  });
  return res.json();
}