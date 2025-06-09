import API_BASE_URL from '../../config';

export async function analyzeContractAPI(formData) {
    // Placeholder function for contract analysis API call
    // This should call your backend endpoint for contract analysis
    //console.log('Calling analyzeContractAPI');
      const res = await fetch(`${API_BASE_URL}/analyze/contract`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }