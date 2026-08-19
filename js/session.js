import { generateUUID, calculateDuration, getTodayString, getCurrentTime } from './utils.js';
import { getAll, getById, add, put, remove, clearStore } from './db.js';

export async function createSession({ activityName, category, date, startTime, endTime, notes }) {
  const durationMinutes = calculateDuration(startTime, endTime);
  const now = new Date().toISOString();

  const session = {
    id: generateUUID(),
    activityName,
    category: category || '',
    date: date || getTodayString(),
    startTime,
    endTime,
    durationMinutes,
    notes: notes || '',
    createdAt: now,
    updatedAt: now,
  };

  await add('sessions', session);
  return session;
}

export async function updateSession(id, updates) {
  const existing = await getById('sessions', id);
  if (!existing) throw new Error('Session non trouvée');

  const updated = {
    ...existing,
    ...updates,
    durationMinutes: calculateDuration(updates.startTime || existing.startTime, updates.endTime || existing.endTime),
    updatedAt: new Date().toISOString(),
  };

  await put('sessions', updated);
  return updated;
}

export async function deleteSession(id) {
  await remove('sessions', id);
}

export async function getSession(id) {
  return getById('sessions', id);
}

export async function getAllSessions() {
  const sessions = await getAll('sessions');
  return sessions.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.startTime.localeCompare(a.startTime);
  });
}

export async function getTodaySessions() {
  const today = getTodayString();
  const all = await getAll('sessions');
  return all
    .filter((s) => s.date === today)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export async function clearAllSessions() {
  await clearStore('sessions');
}

export async function getActivityNames() {
  const sessions = await getAll('sessions');
  const names = [...new Set(sessions.map((s) => s.activityName))];
  return names.sort();
}

export async function getAllCategories() {
  return getAll('categories');
}
