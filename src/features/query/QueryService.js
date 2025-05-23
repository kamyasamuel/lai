export async function queryAPI(type, query) {
    const res = await fetch('http://localhost:8888/query',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ type, query })
    });
    return res.json();
  }