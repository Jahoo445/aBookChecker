import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtistResponse {
  id: string;
  name: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private readonly _clientId = '4f6993cd4fd54564b2f45a0d9a941742';
  private readonly _clientSecret = '9913877d9bdc4065ad25a69b84733471';
  private readonly _tokenUrl = 'https://accounts.spotify.com/api/token';

  private _accessToken: string | null = null;
  private _tokenExpiresAt: number | null = null;
  private _tokenRequest: Promise<string> | null = null;

  constructor(private readonly _http: HttpClient) {}

  public async getAccessToken(): Promise<string> {
    if (this._hasValidToken()) {
      return this._accessToken as string;
    }

    if (this._tokenRequest) {
      return this._tokenRequest;
    }

    this._tokenRequest = this._fetchAccessToken();

    try {
      return await this._tokenRequest;
    } finally {
      this._tokenRequest = null;
    }
  }

  public async getArtist(artistId: string): Promise<SpotifyArtistResponse> {
    const token = await this.getAccessToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return await firstValueFrom(
      this._http.get<SpotifyArtistResponse>(
        `https://api.spotify.com/v1/artists/${artistId}`,
        { headers }
      )
    );
  }

  private _hasValidToken(): boolean {
    if (!this._accessToken || !this._tokenExpiresAt) {
      return false;
    }

    return Date.now() < this._tokenExpiresAt;
  }

  private async _fetchAccessToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials'
    }).toString();

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${this._clientId}:${this._clientSecret}`)}`
    });

    const response = await firstValueFrom(
      this._http.post<SpotifyTokenResponse>(this._tokenUrl, body, { headers })
    );

    this._accessToken = response.access_token;

    const safetyBufferInMs = 60_000;
    this._tokenExpiresAt = Date.now() + response.expires_in * 1000 - safetyBufferInMs;

    return response.access_token;
  }
}