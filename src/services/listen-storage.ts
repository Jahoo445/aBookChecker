import { Injectable } from '@angular/core';

type ArtistAlbumListenCounts = Record<string, Record<string, number>>;

@Injectable({
  providedIn: 'root'
})
export class ListenStorageService {
  private readonly _storageKey = 'album-listen-counts';

  public getListenCount(artistId: string, albumId: string): number {
    const data = this._getAll();
    return data[artistId]?.[albumId] ?? 0;
  }

  public getListenCountsForArtist(artistId: string): Record<string, number> {
    const data = this._getAll();
    return data[artistId] ?? {};
  }

  public setListenCount(artistId: string, albumId: string, count: number): void {
    const data = this._getAll();

    if (!data[artistId]) {
      data[artistId] = {};
    }

    data[artistId][albumId] = count;
    this._saveAll(data);
  }

  public clearArtistListenCounts(artistId: string): void {
    const data = this._getAll();
    delete data[artistId];
    this._saveAll(data);
  }

  public clearAllListenCounts(): void {
    localStorage.removeItem(this._storageKey);
  }

  private _getAll(): ArtistAlbumListenCounts {
    const rawValue = localStorage.getItem(this._storageKey);

    if (!rawValue) {
      return {};
    }

    try {
      return JSON.parse(rawValue) as ArtistAlbumListenCounts;
    } catch {
      return {};
    }
  }

  private _saveAll(data: ArtistAlbumListenCounts): void {
    localStorage.setItem(this._storageKey, JSON.stringify(data));
  }
}