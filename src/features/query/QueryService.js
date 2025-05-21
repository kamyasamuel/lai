export async function queryAPI(type, query) {
    const res = await fetch('https://lawyers.legalaiafrica.com/search',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ type, query })
    });
    return res.json();
  }