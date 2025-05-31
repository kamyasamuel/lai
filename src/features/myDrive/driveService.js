// stubbed – in real life you'd call OAuth endpoints or backend
export async function connectDrive(type) {
  // In a real-world scenario, this would involve making an API call to initiate the connection.
  return new Promise(res => setTimeout(() => res(`${type} connected.`), 1200));
}