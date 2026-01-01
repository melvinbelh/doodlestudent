import { Injectable } from '@angular/core';

/**
 * on fait un Intervalle "occupé" qui est issu d'un calendrier ICS
 * (on se limite à start/end/summary pour rester simple)
 */

export interface BusyInterval {
  summary?: string;
  start: Date;
  end: Date;
}

@Injectable({ providedIn: 'root' })
export class CalendarImportService {
  async loadFromFile(file: File): Promise<BusyInterval[]> {
    const text = await this.readFileAsText(file);
    return this.parseIcsMinimal(text);
  }

  /**
   * Parser minimal iCalendar :
   * - supporte BEGIN:VEVENT / END:VEVENT
   * - lit DTSTART / DTEND / SUMMARY
   * 
   */

  parseIcsMinimal(icsText: string): BusyInterval[] {
    const lines = this.unfoldLines(icsText).split(/\r?\n/).map((l) => l.trim());
    const intervals: BusyInterval[] = [];

    let inEvent = false;
    let dtStartRaw: string | null = null;
    let dtEndRaw: string | null = null;
    let summary: string | null = null;

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        dtStartRaw = null;
        dtEndRaw = null;
        summary = null;
        continue;
      }
      if (line === 'END:VEVENT') {
        // Quand on finit un événement, on le transforme en BusyInterval si possible
        if (inEvent && dtStartRaw && dtEndRaw) {
          const start = this.parseIcsDate(dtStartRaw);
          const end = this.parseIcsDate(dtEndRaw);

          if (start && end && end.getTime() > start.getTime()) {
            intervals.push({summary: summary ?? 'Occupé',start,end,});
          }
        }
        inEvent = false;
        continue;
      }
      if (!inEvent) continue;

      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const left = line.substring(0, idx);
      const value = line.substring(idx + 1);
      const key = left.split(';')[0].toUpperCase();

      if (key === 'DTSTART') dtStartRaw = value;
      if (key === 'DTEND') dtEndRaw = value;
      if (key === 'SUMMARY') summary = value;
    }
    // Tri pour affichage plus lisible
    intervals.sort((a, b) => a.start.getTime() - b.start.getTime());
    return intervals;
  }
  /**
   * ICS "line folding" : une ligne peut continuer sur la suivante si elle commence par espace/tab.
   * On recolle ces lignes pour parser correctement.
   *
   */
  private unfoldLines(text: string): string {
    return text.replace(/\r?\n[ \t]/g, '');
  }

  private parseIcsDate(raw: string): Date | null {
    // Date seule
    if (/^\d{8}$/.test(raw)) {
      const y = Number(raw.slice(0, 4));
      const m = Number(raw.slice(4, 6)) - 1;
      const d = Number(raw.slice(6, 8));
      return new Date(y, m, d, 0, 0, 0);
    }
    // DateTime
    const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
    if (!m) return null;

    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const hh = Number(m[4]);
    const mm = Number(m[5]);
    const ss = Number(m[6]);
    const isUtc = !!m[7];
    return isUtc ? new Date(Date.UTC(y, mo, d, hh, mm, ss)) : new Date(y, mo, d, hh, mm, ss);
  }

  /**
   * Lecture du fichier côté navigateur
   */

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Lecture du fichier ICS impossible.'));
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.readAsText(file);
    });
  }
}