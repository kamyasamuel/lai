export async function queryAPI(type, query) {
    const res = await fetch('http://lawyers.legalaiafrica.com/api/search',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ type, query })
    });
    return res.json();
}