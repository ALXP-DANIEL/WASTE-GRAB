import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { AnalyzeImageResponse } from '@wastegrab/shared';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AiAnalysisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/roboflow-ai`;
  private readonly requestOptions = { withCredentials: true as const };

  analyzeImages(images: File[]) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.http.post<AnalyzeImageResponse>(
      `${this.apiUrl}/analyze-image`,
      formData,
      this.requestOptions,
    );
  }
}
