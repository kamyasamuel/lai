export async function analyzeFileAPI(formData) {
  const res = await fetch('lawyers.legalaiafrica.com/api/analyze', {
    method: 'POST',
    body: formData
  });
  return res.json();
}