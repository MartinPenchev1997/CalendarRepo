import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface FilterCriteria {
  title?: string;
  startDate?: Date;
  endDate?: Date;
  client?: string;
  project?: string;
  minHours?: number;
  maxHours?: number;
  statuses?: any[];
  maintenanceHours?: boolean;
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  filterForm: FormGroup;

  @Output() filterChange = new EventEmitter<FilterCriteria>();

  statusOptions = [
    { value: 'completed', label: 'Completato' },
    { value: 'in-progress', label: 'In Corso' },
    { value: 'pending', label: 'In Attesa' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      title: [''],
      startDate: [null],
      endDate: [null],
      client: [''],
      project: [''],
      minHours: [null],
      maxHours: [null],
      maintenanceHours: [false],
      statuses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Quando il form cambia, emetti il nuovo filtro
    this.filterForm.valueChanges.subscribe(values => {
      this.filterChange.emit(values);
    });
  }

  onStatusChange(status: string, isChecked: boolean) {
    const statuses = this.filterForm.get('statuses') as any;
    if (isChecked) {
      statuses.push(this.fb.control(status));
    } else {
      const index = statuses.value.indexOf(status);
      statuses.removeAt(index);
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      title: '',
      startDate: null,
      endDate: null,
      client: '',
      project: '',
      minHours: null,
      maxHours: null,
      maintenanceHours: null,
      statuses: []
    });
  }
}
