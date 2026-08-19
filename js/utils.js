export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDate(dateStr, format = 'DD/MM/YYYY') {
  const [year, month, day] = dateStr.split('-');
  if (format === 'YYYY-MM-DD') return dateStr;
  return `${day}/${month}/${year}`;
}

export function formatTime(timeStr) {
  return timeStr;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}` : `${h}h 00`;
}

export function calculateDuration(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const diff = (endH * 60 + endM) - (startH * 60 + startM);
  return diff > 0 ? diff : diff + 24 * 60;
}

export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

export function formatTimerDisplay(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function confirmDialog({ title, message, confirmText = 'Supprimer', cancelText = 'Annuler' }) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal modal-confirm';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const text = document.createElement('p');
    text.textContent = message;
    text.style.marginBottom = '20px';

    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'btn btn-ghost';
    btnCancel.textContent = cancelText;

    const btnConfirm = document.createElement('button');
    btnConfirm.type = 'button';
    btnConfirm.className = 'btn btn-danger';
    btnConfirm.textContent = confirmText;

    actions.appendChild(btnCancel);
    actions.appendChild(btnConfirm);

    modal.appendChild(heading);
    modal.appendChild(text);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = (result) => {
      overlay.remove();
      resolve(result);
    };

    btnConfirm.addEventListener('click', () => close(true));
    btnCancel.addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  });
}

export function getSettings() {
  const defaults = { timeFormat: '24h', dateFormat: 'DD/MM/YYYY' };
  try {
    const stored = localStorage.getItem('timetrack_settings');
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  localStorage.setItem('timetrack_settings', JSON.stringify(settings));
}
