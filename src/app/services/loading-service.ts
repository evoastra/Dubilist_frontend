// loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();

  show() {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      Promise.resolve().then(() => this.loadingSubject.next(true));
    }
  }

  hide() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      Promise.resolve().then(() => this.loadingSubject.next(false));
    }
  }
}