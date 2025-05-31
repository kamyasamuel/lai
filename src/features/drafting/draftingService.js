export async function draftAPI(prompt) {
    const res = await fetch('https://lawyers.legalaiafrica.com/api/draft', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ prompt })
    });
    return res.json();
  }