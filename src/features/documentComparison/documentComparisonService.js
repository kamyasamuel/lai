import API_BASE_URL from '../../config';

export async function compareDocumentsAPI(formData) {
  try {
    const res = await fetch(`${API_BASE_URL}/compare-documents`, {
      method: 'POST', 
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error in compareDocumentsAPI:', errorData);
      throw new Error(errorData.message || 'Failed to compare documents.');
    }
    return res.json();
  } catch (error) {
    console.error('Exception in compareDocumentsAPI:', error);
    throw new Error('An error occurred while comparing documents.');
  }
}