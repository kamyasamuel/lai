export async function analyzeFileAPI(formData) {
  const res = await fetch('http://localhost:8888/analyze', {
    method: 'POST',
    body: formData
  });
  return res.json();
}