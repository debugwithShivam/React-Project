const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchSiteContent() {
  const response = await fetch(`${API_URL}/content`);
  if (!response.ok) throw new Error('Unable to load site content');
  const result = await response.json();
  return result.data;
}

export async function saveSiteContent(content) {
  const response = await fetch(`${API_URL}/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content)
  });
  if (!response.ok) throw new Error('Unable to save site content');
  const result = await response.json();
  return result.data;
}
