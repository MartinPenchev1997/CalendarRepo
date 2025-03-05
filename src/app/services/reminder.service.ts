// src/app/reminder.service.ts
import { Injectable } from '@angular/core';
import { EventService } from './event.service';
import { Commesse } from '../models/commessa.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private reminderInterval: any;

  constructor(private eventService: EventService) { }

  // Avvia il controllo periodico per i promemoria
  startReminders(): void {
    // Richiedi il permesso per le notifiche se non già concesso
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    // Pulisce eventuali intervalli già attivi
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    // Esegue il controllo ogni minuto (60000 ms)
    this.reminderInterval = setInterval(() => {
      this.checkReminders();
    }, 60000);

    // Esegui subito un controllo iniziale
    this.checkReminders();
  }

  // Ferma i promemoria
  stopReminders(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  // Controlla se ci sono eventi imminenti e invia una notifica
  private checkReminders(): void {
    const events: Commesse[] = this.eventService.getEvents();
    const now = new Date();
    // Impostiamo un intervallo di promemoria: eventi che iniziano entro i prossimi 1000 minuti
    const reminderLimit = new Date(now.getTime() + 1000 * 60000);

    events.forEach(e => {
      const eventDate = new Date(e.date);
      // Se l'evento è futuro e rientra nell'intervallo di 15 minuti
      if (eventDate > now && eventDate <= reminderLimit) {
        setTimeout(() => {
          // Se le notifiche sono supportate e il permesso è stato concesso
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Promemoria Commesse', {
              body: `La commessa "${e.title}" inizia alle ${eventDate.toLocaleTimeString()}.`
            });
          }
        }, 5000);
      }
    });
  }
}
