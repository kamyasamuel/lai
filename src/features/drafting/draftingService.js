import API_BASE_URL from '../../config';

export async function draftAPI(prompt) {
    const res = await fetch(`${API_BASE_URL}/draft`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ prompt })
    });
    return res.json();
  }