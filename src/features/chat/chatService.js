export async function sendToChatAPI(message) {
  const res = await fetch('https://lawyers.legalaiafrica.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}