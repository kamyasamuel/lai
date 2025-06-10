import API_BASE_URL from '../../config';

export async function uploadDriveDocumentAPI(formData) {
  try {
    const res = await fetch(`${API_BASE_URL}/upload-drive-document`, {
      method: 'POST',
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