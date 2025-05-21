export async function analyzeFileAPI(formData) {
  const res = await fetch('https://lawyers.legalaiafrica.com/analyze', {
    method: 'POST',
    body: formData
  });
  return res.json();
}