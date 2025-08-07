import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';
import { API_URL } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private errorService = inject(ErrorService);
  private httpClient = inject(HttpClient);
  private userPlaces = signal<Place[]>([]);

  private apiUrl = API_URL;

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces(
      this.apiUrl+'/places',
      'Something went wrong fetching available places, please try again sometime later...'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      this.apiUrl+'/user-places',
      'Something went wrong fetching your faviroute places, please try again sometime later...'
    ).pipe(tap({
      next: (userPlaces) => this.userPlaces.set(userPlaces)
    }));
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if(!prevPlaces.some((p) => p.id === place.id)){
      this.userPlaces.set([...prevPlaces, place]);
    }

    return this.httpClient.put(this.apiUrl+'/user-places', {
      placeId: place.id,
    }).pipe(
      catchError(error => {
        this.userPlaces.set(prevPlaces);
        this.errorService.showError('Failed to store selected place');
        return throwError(() => new Error('Failed to store selected place'));
      })
    );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();

    if(prevPlaces.some((p) => p.id === place.id)){
      this.userPlaces.set(prevPlaces.filter(p => p.id !== place.id));
    }

    return this.httpClient.delete<{places: Place[]}>(`${this.apiUrl}/user-places/${place.id}`)
                .pipe(
                  map((resData) => resData.places),
                  catchError((error) => {
                    this.userPlaces.set(prevPlaces);
                    this.errorService.showError(`Unable to Delete User Place ${place.title}`);
                    return throwError(() => new Error(`Unable to Delete User Place ${place.id}`));
                  })
                )
  }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{places: Place[]}>(url)
                .pipe(
                  map((resData) => resData.places),
                  catchError((error) => {
                    return throwError(() => new Error(errorMessage));
                  })
                );
  }
}
