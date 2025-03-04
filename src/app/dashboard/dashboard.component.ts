import { Component, OnInit } from '@angular/core';
import { Commesse } from '../models/commessa.model';
import { EventService } from '../services/event.service';
import { ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Array degli eventi
  events: Commesse[] = [];

  // ---------- Grafico 1: Totale Ore per Mese ----------
  public chart1Labels: string[] = [];
  public chart1Data: number[] = [];
  public chart1Options: any = {
    responsive: true,
    title: {
      display: true,
      text: 'Totale Ore per Mese'
    },
    plugins: {
      legend: { display: true }
    }
  };
  public chart1Type: ChartType = 'bar';

  // ---------- Grafico 2: Totale Ore di Manutenzione per Commesse ----------
  public chart2Labels: string[] = [];
  public chart2Data: number[] = [];
  public chart2Options: any = {
    responsive: true,
    title: {
      display: true,
      text: 'Totale Ore di Manutenzione per Commesse'
    },
    plugins: {
      legend: { display: true }
    }
  };
  public chart2Type: ChartType = 'pie'; // oppure 'doughnut'

  // ---------- Grafico 3: Report Annuale ----------
  public chart3Labels: string[] = [];
  public chart3Data: any[] = [];
  public chart3Options: any = {
    responsive: true,
    title: {
      display: true,
      text: 'Report Annuale: Ore Totali e Manutenzione'
    },
    plugins: {
      legend: { display: true }
    }
  };
  public chart3Type: ChartType = 'bar';

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.events = this.eventService.getEvents();
    this.prepareChart1();
    this.prepareChart2();
    this.prepareChart3();
  }

  // Raggruppa per mese e somma le ore
  prepareChart1(): void {
    const monthMap: { [key: string]: number } = {};
    this.events.forEach(event => {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthMap[key]) {
        monthMap[key] = 0;
      }
      monthMap[key] += event.hours;
    });
    // Ordina le chiavi per data
    const sortedKeys = Object.keys(monthMap).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA === yearB) {
        return monthA - monthB;
      }
      return yearA - yearB;
    });
    this.chart1Labels = sortedKeys.map(key => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1);
      return date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
    });
    this.chart1Data = sortedKeys.map(key => monthMap[key]);
  }

  // Raggruppa per commessa e somma le ore di manutenzione
  prepareChart2(): void {
    const commessaMap: { [key: string]: number } = {};
    this.events.forEach(event => {
      if (!commessaMap[event.title]) {
        commessaMap[event.title] = 0;
      }
      commessaMap[event.title] += event.maintenanceHours?1:0;
    });
    this.chart2Labels = Object.keys(commessaMap);
    this.chart2Data = Object.values(commessaMap);
  }

  // Raggruppa per anno e crea due dataset: uno per ore totali e uno per manutenzione totale
  prepareChart3(): void {
    const yearMap: { [key: string]: { totalHours: number, totalMaintenance: number } } = {};
    this.events.forEach(event => {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}`;
      if (!yearMap[key]) {
        yearMap[key] = { totalHours: 0, totalMaintenance: 0 };
      }
      yearMap[key].totalHours += event.hours;
      yearMap[key].totalMaintenance += event.maintenanceHours?1:0;
    });
    const sortedYears = Object.keys(yearMap).sort((a, b) => Number(a) - Number(b));
    this.chart3Labels = sortedYears;
    const totalHoursData = sortedYears.map(year => yearMap[year].totalHours);
    const totalMaintenanceData = sortedYears.map(year => yearMap[year].totalMaintenance);
    this.chart3Data = [
      { data: totalHoursData, label: 'Ore Totali' },
      { data: totalMaintenanceData, label: 'Manutenzione Totale' }
    ];
  }
}
