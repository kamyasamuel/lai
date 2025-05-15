export async function draftAPI(prompt) {
    const res = await fetch('http://localhost:8888/draft', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ prompt })
    });
    return res.json();
  }