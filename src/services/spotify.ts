import { firstValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyTokenResponse } from '../types/SpotifyTokenResponse';

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

  constructor(private readonly _http: HttpClient) { }

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

    // Refresh a little early so you don’t hit the exact expiration boundary
    const safetyBufferInMs = 60_000;
    this._tokenExpiresAt = Date.now() + response.expires_in * 1000 - safetyBufferInMs;

    return response.access_token;
  }

  public clearTokenCache(): void {
    this._accessToken = null;
    this._tokenExpiresAt = null;
    this._tokenRequest = null;
  }
}