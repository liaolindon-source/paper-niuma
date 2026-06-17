const API_BASE = 'http://localhost:8000/api';

export async function apiJson(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || '请求失败');
  }
  return data;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/upload/`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || '上传失败');
  }
  return data;
}

export function getFlowState() {
  const raw = localStorage.getItem('paperNiumaFlow');
  return raw ? JSON.parse(raw) : {};
}

export function updateFlowState(patch) {
  const next = { ...getFlowState(), ...patch };
  localStorage.setItem('paperNiumaFlow', JSON.stringify(next));
  return next;
}
