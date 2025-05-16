export async function analyzeContractAPI(formData) {
    // Placeholder function for contract analysis API call
    // This should call your backend endpoint for contract analysis
    //console.log('Calling analyzeContractAPI');
      const res = await fetch('http://localhost:8888/analyze/contract', {
      method: 'POST',
      body: formData
    });
    return res.json();
  }