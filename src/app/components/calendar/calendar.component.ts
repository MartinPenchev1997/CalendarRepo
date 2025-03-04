import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { Commesse } from 'src/app/models/commessa.model';
import { EventService } from 'src/app/services/event.service';
import { EventData, EventDialogComponent } from '../event-dialog/event-dialog.component';
import { FilterCriteria } from '../filter/filter.component';
import { ExtendedCalendarEvent } from 'src/app/models/calendar-event.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  viewDate: Date = new Date();
  calendarEvents: ExtendedCalendarEvent[] = [];
  // Conserva tutti gli eventi e quelli filtrati separatamente
  allEvents: Commesse[] = [];
  // filteredEvents: CalendarEvent[] = [];

  constructor(
    private eventService: EventService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // const events: Commesse[] = this.eventService.getEvents();
    this.allEvents = this.eventService.getEvents();
    this.calendarEvents = this.allEvents.map(e => ({
      id: e.id,
      start: new Date(e.date),
      meta: { id: e.id, original: e },  // Conserva l'evento originale
      title: `${e.title} (Ore: ${e.hours}, Manutenzione: ${e.maintenanceHours})`,
      client: e.client,
      project: e.project,
      status: e.status,
      hours: e.hours,
      minHours: e.start,
      maxHours: e.end,
      maintenanceHours: e.maintenanceHours
      // Altre proprietà opzionali di CalendarEvent...
    }));

    this.applyFilter({}); // inizialmente nessun filtro
  }

  applyFilter(criteria: FilterCriteria): void {
    let filtered = this.allEvents;

    if (criteria.title && criteria.title.trim() !== '') {
      filtered = filtered.filter(e => e.title.toLowerCase().includes(criteria.title!.toLowerCase()));
    }

    // if (criteria.startDate) {
    //   filtered = filtered.filter(e => new Date(e.date) >= new Date(criteria.startDate!));
    // }

    // if (criteria.endDate) {
    //   filtered = filtered.filter(e => new Date(e.date) <= new Date(criteria.endDate!));
    // }

    if (criteria.minHours != null) {
      filtered = filtered.filter(e => e.start >= criteria.minHours!);
    }

    if (criteria.maxHours != null) {
      filtered = filtered.filter(e => e.end <= criteria.maxHours!);
    }

    if (criteria.maintenanceHours) {
      filtered = filtered.filter(e => e.maintenanceHours == criteria.maintenanceHours!);
    }

    if (criteria.statuses && criteria.statuses.length > 0) {
      filtered = filtered.filter(e => criteria.statuses!.includes(e.status));
    }

    if (criteria.client) {
      filtered = filtered.filter(e => e.client ? criteria.client!.includes(e.client) : true);
    }

    if (criteria.project) {
      filtered = filtered.filter(e => e.project ? criteria.project!.includes(e.project) : true);
    }

    // Mappa gli eventi filtrati al formato richiesto da angular-calendar
    this.calendarEvents = filtered.map(e => ({
      id: e.id,
      start: new Date(e.date),
      title: `${e.title} (Ore: ${e.hours}, Manutenzione: ${e.maintenanceHours})`,
      client: e.client,
      project: e.project,
      status: e.status,
      hours: e.hours,
      minHours: e.start,
      maxHours: e.end,
      maintenanceHours: e.maintenanceHours
    }));

  }

  dayClicked(event: any): void {
    // Apri il dialog per aggiungere una nuova commessa per il giorno cliccato
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '400px',
      data: {
        id: this.eventService.getNewIndex(), // generazione semplice dell'ID
        date: event.day.date,
        title: '',
        hours: 0,
        maintenanceHours: false,
        start: 8,
        end: 17,
        status: 'in-progress'
      } as EventData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se si è salvato il dialog, aggiungi la commessa tramite il service
        const newEvent: Commesse = {
          id: result.id,
          date: result.date,
          start: result.start,
          end: result.end,
          status: result.status,
          client: result.client,
          project: result.project,
          title: result.title,
          hours: result.hours,
          maintenanceHours: result.maintenanceHours
        };
        this.eventService.addEvent(newEvent);
      }
      this.loadEvents(); // ricarica gli eventi per aggiornare il calendario
    });
  }

  eventClicked(data: any) {
    const event = this.calendarEvents.find(f => f.title == data.event.title);
    const storedEvent = this.allEvents.find(f => f.id == event?.id);
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '400px',
      data: {
        id: storedEvent?.id,
        date: storedEvent?.date,
        title: storedEvent?.title,
        hours: storedEvent?.hours,
        maintenanceHours: storedEvent?.maintenanceHours,
        end: storedEvent?.end,
        start: storedEvent?.start,
        project: storedEvent?.project,
        client: storedEvent?.client,
        status: storedEvent?.status
      } as EventData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se si è salvato il dialog, aggiungi la commessa tramite il service
        const newEvent: Commesse = {
          id: result.id,
          date: result.date,
          title: result.title,
          hours: result.hours,
          maintenanceHours: result.maintenanceHours,
          start: result.start,
          end: result.end,
          status: result.status,
          client: result.client,
          project: result.project
        };
        this.eventService.updateEvent(newEvent);
      }
      this.loadEvents(); // ricarica gli eventi per aggiornare il calendario
    });
  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
  }

  previousYear(): void {
    this.viewDate = new Date(this.viewDate.getFullYear() - 1, this.viewDate.getMonth(), 1);
  }

  nextYear(): void {
    this.viewDate = new Date(this.viewDate.getFullYear() + 1, this.viewDate.getMonth(), 1);
  }

  drop(event: CdkDragDrop<any>, cell: any): void {
    // Recupera l'evento trascinato dalla proprietà data
    const draggedEvent = event.item.data;
    // La nuova data è quella della cella drop target
    const newDate = cell.date;

    // Recupera l'evento originale salvato in meta
    let originalEvent: Commesse = draggedEvent.meta.original;
    // Aggiorna la data dell'evento
    originalEvent.date = newDate;

    // Salva l'aggiornamento usando il service
    this.eventService.updateEvent(originalEvent);

    // Ricarica gli eventi per aggiornare la vista
    this.loadEvents();
  }

  exportData(): void {
    const events = this.eventService.getEvents();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "commesseData.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}
