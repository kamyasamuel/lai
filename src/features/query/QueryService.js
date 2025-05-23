export async function queryAPI(type, query) {
<<<<<<< HEAD
    const res = await fetch('http://localhost:8888/query',{
=======
    const res = await fetch('https://lawyers.legalaiafrica.com/search',{
>>>>>>> fd449b0d80104b496d636d9b01d4a4b513877d27
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ type, query })
    });
    return res.json();
  }