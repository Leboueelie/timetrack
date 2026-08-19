import { formatDate, formatDuration, getSettings, showToast } from './utils.js';

export function renderSessionsTable(sessions) {
  const tbody = document.getElementById('sessionsBody');
  const emptyState = document.getElementById('emptyState');
  const table = document.getElementById('sessionsTable');
  const settings = getSettings();

  if (!sessions || sessions.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (table) table.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (table) table.style.display = 'table';

  if (!tbody) return;
  tbody.innerHTML = '';

  sessions.forEach((session) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(session.activityName)}</td>
      <td>${session.category ? escapeHTML(session.category) : '—'}</td>
      <td>${formatDate(session.date, settings.dateFormat)}</td>
      <td>${session.startTime}</td>
      <td>${session.endTime}</td>
      <td>${formatDuration(session.durationMinutes)}</td>
      <td>
        <button class="btn-icon btn-edit" data-id="${session.id}" title="Modifier">✏️</button>
        <button class="btn-icon btn-delete" data-id="${session.id}" title="Supprimer">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const event = new CustomEvent('editSession', { detail: { id: btn.dataset.id } });
      document.dispatchEvent(event);
    });
  });

  tbody.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const event = new CustomEvent('deleteSession', { detail: { id: btn.dataset.id } });
      document.dispatchEvent(event);
    });
  });
}

export function filterSessions(sessions, { search, dateFrom, dateTo }) {
  return sessions.filter((session) => {
    if (search && !session.activityName.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (dateFrom && session.date < dateFrom) return false;
    if (dateTo && session.date > dateTo) return false;
    return true;
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
