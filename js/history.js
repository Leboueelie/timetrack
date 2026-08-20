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
      <td data-label="Activité">${escapeHTML(session.activityName)}</td>
      <td data-label="Catégorie">${session.category ? escapeHTML(session.category) : '—'}</td>
      <td data-label="Date">${formatDate(session.date, settings.dateFormat)}</td>
      <td data-label="Début">${session.startTime}</td>
      <td data-label="Fin">${session.endTime}</td>
      <td data-label="Durée">${formatDuration(session.durationMinutes)}</td>
      <td class="td-actions">
        <button class="btn-icon btn-edit" data-id="${session.id}" title="Modifier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
        <button class="btn-icon btn-delete" data-id="${session.id}" title="Supprimer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
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
