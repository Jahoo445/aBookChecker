import { firstValueFrom } from 'rxjs';
import { Injectable } from '@angular/core';
import { SpotifyAlbumItem } from '../types/SpotifyAlbumItem';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpotifyTokenResponse } from '../types/SpotifyTokenResponse';
import { SpotifyArtistResponse } from '../types/SpotifyArtistResponse';
import { SpotifyArtistAlbumsResponse } from '../types/SpotifyArtistAlbumsResponse';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private readonly _tokenApiUrl = 'https://api.janishofstetter.com/tokens/spotify';

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

  public async getArtistAlbums(artistId: string): Promise<SpotifyAlbumItem[]> {
    const token = await this.getAccessToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const limit = 50;
    let offset = 0;
    let total = 0;

    const albums: SpotifyAlbumItem[] = [];

    do {
      const response = await firstValueFrom(
        this._http.get<SpotifyArtistAlbumsResponse>(
          `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=${limit}&offset=${offset}`,
          { headers }
        )
      );

      albums.push(...response.items);

      total = response.total;
      offset += limit;
    } while (offset < total);

    const filteredAlbums = albums
      .filter(album => /^(Folge|\d+)/i.test(album.name))
      .filter(album => album.name !== '134/ der tote Mönch');

    return filteredAlbums;
  }

  private _hasValidToken(): boolean {
    if (!this._accessToken || !this._tokenExpiresAt) {
      return false;
    }

    return Date.now() < this._tokenExpiresAt;
  }

  private async _fetchAccessToken(): Promise<string> {
    const response = await firstValueFrom(
      this._http.get<SpotifyTokenResponse>(this._tokenApiUrl)
    );

    this._accessToken = response.access_token;

    const safetyBufferInMs = 60_000;
    this._tokenExpiresAt = Date.now() + response.expires_in * 1000 - safetyBufferInMs;

    return response.access_token;
  }
}