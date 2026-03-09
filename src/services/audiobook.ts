import { firstValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AudiobookArtist } from '../types/AudiobookArtist';

@Injectable({
  providedIn: 'root'
})

export class AudiobookService {

  private readonly _url = 'https://api.janishofstetter.com/sposhu/audiobooks';

  constructor(private readonly _http: HttpClient) { }

  public async getAudiobookArtists(): Promise<AudiobookArtist[]> {
    return await firstValueFrom(
      this._http.get<AudiobookArtist[]>(this._url)
    )
  }
}