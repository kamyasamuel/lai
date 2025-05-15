// stubbed – in real life you'd call OAuth endpoints or backend
export async function connectDrive(type) {
    return new Promise(res => setTimeout(()=>res(`${type} connected.`),1200));
  }