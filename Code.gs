const SHEET_NAME = 'RSVP';
const EVENT_NAME = 'Carlos Fernando Poma cumple 2';
const MAX_PER_FIELD = 300;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Honeypot: los usuarios reales nunca completan este campo.
    if (String(p.website || '').trim()) {
      return json_({ ok: false, error: 'spam' });
    }

    const startedAt = Number(p.startedAt || 0);
    if (!startedAt || (Date.now() - startedAt) < 1500) {
      return json_({ ok: false, error: 'too_fast' });
    }

    const submissionId = clean_(p.submissionId, 80);
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(submissionId)) {
      return json_({ ok: false, error: 'invalid_submission' });
    }

    const cache = CacheService.getScriptCache();
    if (cache.get('rsvp:' + submissionId)) {
      return json_({ ok: true, duplicate: true });
    }

    const nombre = clean_(p.nombre, 80);
    const asistenciaRaw = clean_(p.asistencia, 8).toLowerCase();
    const asistencia = asistenciaRaw === 'si' || asistenciaRaw === 'sí' ? 'Sí' : asistenciaRaw === 'no' ? 'No' : '';
    const mensaje = clean_(p.mensaje, MAX_PER_FIELD);
    const evento = clean_(p.evento || EVENT_NAME, 100);

    if (!nombre || !asistencia) {
      return json_({ ok: false, error: 'missing_required' });
    }

    let adultos = clampInt_(p.adultos, 0, 15);
    let ninos = clampInt_(p.ninos, 0, 15);
    if (asistencia === 'No') {
      adultos = 0;
      ninos = 0;
    }
    if (asistencia === 'Sí' && (adultos + ninos) < 1) {
      return json_({ ok: false, error: 'guest_count' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Fecha y hora',
          'Asistencia',
          'Nombre y apellido',
          'Adultos',
          'Niños',
          'Mensaje',
          'Evento',
          'ID envío'
        ]);
        sheet.setFrozenRows(1);
      }

      sheet.appendRow([
        new Date(),
        asistencia,
        nombre,
        adultos,
        ninos,
        mensaje,
        evento,
        submissionId
      ]);
    } finally {
      lock.releaseLock();
    }

    // Evita reenvíos accidentales durante 6 horas.
    cache.put('rsvp:' + submissionId, '1', 21600);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

function clean_(value, maxLen) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function clampInt_(value, min, max) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
