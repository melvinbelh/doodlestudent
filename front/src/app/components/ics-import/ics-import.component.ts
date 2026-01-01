import { Component, EventEmitter, Output } from '@angular/core';
import { BusyInterval, CalendarImportService } from '../../services/calendrier-import.service';

@Component({
  selector: 'app-ics-import',
  templateUrl: './ics-import.component.html',
  styleUrls: ['./ics-import.component.css'],
})

export class IcsImportComponent {

  @Output() busyChanged = new EventEmitter<BusyInterval[]>();
  busy: BusyInterval[] = [];
  loading = false;
  error: string | null = null;

  constructor(private calendarImport: CalendarImportService) {}

  async onFileSelected(event: Event) {  
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // on accepte uniquement .ics
    const isIcs = file.name.toLowerCase().endsWith('.ics');
    if (!isIcs) {
      this.error = 'Fichier non valide. on attend un fichier : .ics (iCalendar).';
      this.busy = [];
      this.busyChanged.emit(this.busy);
      input.value = '';
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      const intervals = await this.calendarImport.loadFromFile(file);
      this.busy = intervals;
      this.busyChanged.emit(this.busy);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'Import ICS impossible.';
      this.busy = [];
      this.busyChanged.emit(this.busy);
    } finally { 
      this.loading = false;
      input.value = ''; // OPn peut re-importer le meme fichier
    }
  }

  clear() { 
    this.busy = [];
    this.error = null;
    this.busyChanged.emit(this.busy);
  }

  // Format date compatible partout

  format(dt: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = pad(dt.getDate());
    const m = pad(dt.getMonth() + 1);
    const y = dt.getFullYear();
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    return `${d}/${m}/${y} ${hh}:${mm}`;
  }
}