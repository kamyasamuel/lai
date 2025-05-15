export async function sendToChatAPI(message) {
  const res = await fetch('http://localhost:8888/chat', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}