import { Component, OnInit } from '@angular/core';
import { Commesse } from 'src/app/models/commessa.model';
import { EventService } from 'src/app/services/event.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface CommesseGrouped {
  title: string;
  totalHours: number;
  totalMaintenance: number;
  eventsCount: number;
  records: Commesse[];
}

interface MonthlyReport {
  month: string;
  totalHours: number;
  totalMaintenance: number;
  eventsCount: number;
  details: CommesseGrouped[];
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class ReportComponent implements OnInit {
  reports: MonthlyReport[] = [];
  // Variabile per la riga espansa
  expandedElement: MonthlyReport | null = null;
  expandedCommessa: CommesseGrouped | null = null;

  displayedColumns: string[] = ['month', 'totalHours', 'totalMaintenance', 'eventsCount'];
  displayedColumnsInner: string[] = ['title', 'totalHours', 'totalMaintenance', 'eventsCount'];

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    const events: Commesse[] = this.eventService.getEvents();
    const reportMap: { [key: string]: MonthlyReport } = {};

    events.forEach(event => {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!reportMap[key]) {
        reportMap[key] = {
          month: date.toLocaleString('it-IT', { month: 'long', year: 'numeric' }),
          totalHours: 0,
          totalMaintenance: 0,
          eventsCount: 0,
          details: []
        };
      }
      reportMap[key].totalHours += event.hours;
      reportMap[key].totalMaintenance += event.maintenanceHours ? 1 : 0;
      reportMap[key].eventsCount++;

      // Raggruppa per titolo
      const existing = reportMap[key].details.find(d => d.title === event.title);
      if (existing) {
        existing.totalHours += event.hours;
        existing.totalMaintenance += event.maintenanceHours ? 1 : 0;
        existing.eventsCount++;
        existing.records.push(event);
      } else {
        reportMap[key].details.push({
          title: event.title,
          totalHours: event.hours,
          totalMaintenance: event.maintenanceHours ? 1 : 0,
          eventsCount: 1,
          records: [event]
        });
      }
    });

    // Trasforma l'oggetto in un array ordinato per data
    this.reports = Object.values(reportMap).sort((a, b) => a.month.localeCompare(b.month));
  }
}
