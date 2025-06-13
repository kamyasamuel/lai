import API_BASE_URL from '../../config';

// Fetch only documents uploaded by the current user
export const fetchUserDocumentsAPI = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user-documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching user documents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
};

// Update the upload API to include the token
export async function uploadDriveDocumentAPI(formData, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/upload-user-document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Error in uploadDriveDocumentAPI:', errorData);
      throw new Error(errorData.message || 'Failed to upload document to drive.');
    }
    return res.json();
  } catch (error) {
    console.error('Exception in uploadDriveDocumentAPI:', error);
    throw new Error('An error occurred while uploading document to drive.');
  }
}