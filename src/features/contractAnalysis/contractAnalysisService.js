import API_BASE_URL from '../../config';

export async function analyseContractAPI(formData) {
  const response = await fetch(`${API_BASE_URL}/analyse_contract`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function chatWithContractAPI(prompt, conversationHistory) {
  const response = await fetch(`${API_BASE_URL}/chat_with_contract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, conversation_history: conversationHistory }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
