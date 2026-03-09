import { Injectable } from '@angular/core';

type CachedArtist = {
  artistName: string;
  artistId: string;
  imageUrl: string | null;
};

type ArtistCache = {
  updatedAt: number;
  artists: CachedArtist[];
};

@Injectable({
  providedIn: 'root'
})
export class ArtistCacheService {
  private readonly _storageKey = 'artist-selection-cache';

  public getArtists(): CachedArtist[] {
    return this._getCache()?.artists ?? [];
  }

  public setArtists(artists: CachedArtist[]): void {
    const cache: ArtistCache = {
      updatedAt: Date.now(),
      artists
    };

    localStorage.setItem(this._storageKey, JSON.stringify(cache));
  }

  public hasArtists(): boolean {
    return this.getArtists().length > 0;
  }

  public clear(): void {
    localStorage.removeItem(this._storageKey);
  }

  private _getCache(): ArtistCache | null {
    const rawValue = localStorage.getItem(this._storageKey);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as ArtistCache;
    } catch {
      return null;
    }
  }
}