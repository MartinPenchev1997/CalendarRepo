import { Injectable } from '@angular/core';
import { Commesse } from '../models/commessa.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private storageKey = 'commesseData';

  getEvents(): Commesse[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getNewIndex() {
    const data = localStorage.getItem(this.storageKey);
    return data?.lastIndexOf('id') || 0 + 1;
  }

  saveEvents(events: Commesse[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(events));
  }

  addEvent(event: Commesse): void {
    const events = this.getEvents();
    events.push(event);
    this.saveEvents(events);
  }

  updateEvent(updatedEvent: Commesse): void {
    let events = this.getEvents();
    events = events.map(event => event.id === updatedEvent.id ? updatedEvent : event);
    this.saveEvents(events);
  }

  deleteEvent(eventId: number): void {
    let events = this.getEvents();
    events = events.filter(event => event.id !== eventId);
    this.saveEvents(events);
  }
}
