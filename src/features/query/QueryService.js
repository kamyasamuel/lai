import API_BASE_URL from '../../config';

export async function queryAPI(type, query) {
    const res = await fetch(`${API_BASE_URL}/query`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ type, query })
    });
    return res.json();
}