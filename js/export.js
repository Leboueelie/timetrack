import { formatDate, formatDuration, getSettings, showToast } from './utils.js';

export function exportToCSV(sessions) {
  const settings = getSettings();
  const separator = ';';

  const headers = ['id', 'activite', 'categorie', 'date', 'heure_debut', 'heure_fin', 'duree_minutes', 'notes'];

  const rows = sessions.map((s) => [
    s.id,
    `"${(s.activityName || '').replace(/"/g, '""')}"`,
    `"${(s.category || '').replace(/"/g, '""')}"`,
    formatDate(s.date, settings.dateFormat),
    s.startTime,
    s.endTime,
    s.durationMinutes,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(separator), ...rows.map((r) => r.join(separator))].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `timetrack_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  URL.revokeObjectURL(url);
  showToast(`Export CSV généré (${sessions.length} sessions)`);
}
