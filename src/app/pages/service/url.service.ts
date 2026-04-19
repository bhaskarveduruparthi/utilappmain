import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor() { }

  getApiUrl() : string {
    return `${environment.protocol}://${environment.apiBaseHost}/`;
  }


}
