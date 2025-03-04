import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from 'src/app/services/event.service';

export interface EventData {
  id: number;
  title: string;
  date: Date;
  start: number;
  end: number;
  hours: number;
  maintenanceHours: boolean;
  client?: string;
  project?: string;
  status: 'completed' | 'in-progress' | 'pending';
}

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})

export class EventDialogComponent {
  eventForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventData,
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    // Inizializza il form con i dati passati (oppure valori di default)
    this.eventForm = this.fb.group({
      title: [data.title, Validators.required],
      hours: [data.hours, [Validators.required, Validators.min(0)]],
      maintenanceHours: [data.maintenanceHours, [Validators.required, Validators.min(0)]],
      start: [data.start, [Validators.required]],
      end: [data.end, [Validators.required]],
      client: [data.client, []],
      project: [data.project, []],
      status: [data.status, [Validators.required]],
    });
  }

  onSave(): void {
    if (this.eventForm.valid) {
      // Raccogli i dati dal form e li restituisce
      const result: EventData = {
        id: this.data.id,
        date: this.data.date,
        ...this.eventForm.value
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.eventService.deleteEvent(this.data.id);
    this.dialogRef.close();
  }
}
