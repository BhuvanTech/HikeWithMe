import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { Place } from '../place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit{
  isFetching = signal(false);
  error = signal('');
  
  private placeService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  places = this.placeService.loadedUserPlaces;
  
  ngOnInit(){
      this.isFetching.set(true);
  
      const subscripition = this.placeService.loadUserPlaces()
        .subscribe({
          error: (err) => this.error.set(err.message),
          complete: () => this.isFetching.set(false)
        });
  
      this.destroyRef.onDestroy(() => {
        subscripition.unsubscribe();
      });
    }

    onRemovePlace(place: Place){
      const subscripition = this.placeService.removeUserPlace(place)
                                .subscribe();

      this.destroyRef.onDestroy(() => {
        subscripition.unsubscribe();
      })
    }
}
