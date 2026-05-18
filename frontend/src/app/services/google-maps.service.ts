import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GoogleMapsService {
  private loadPromise: Promise<void> | null = null;

  readonly isConfigured = Boolean(environment.googleMapsApiKey?.trim());

  loadPlaces(): Promise<void> {
    if ((window as any).google?.maps?.places) {
      return Promise.resolve();
    }

    if (!this.isConfigured) {
      return Promise.reject(new Error('Google Maps API key is not configured.'));
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const callbackName = '__wastegrabGoogleMapsReady';
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-wastegrab-google-maps]');

      (window as any)[callbackName] = () => {
        resolve();
        delete (window as any)[callbackName];
      };

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Unable to load Google Maps.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      const params = new URLSearchParams({
        key: environment.googleMapsApiKey.trim(),
        libraries: 'places',
        loading: 'async',
        callback: callbackName,
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.dataset['wastegrabGoogleMaps'] = 'true';
      script.onerror = () => reject(new Error('Unable to load Google Maps.'));

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
