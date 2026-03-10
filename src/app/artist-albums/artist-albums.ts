import { ActivatedRoute, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify.service';
import { SpotifyAlbumItem } from '../../types/SpotifyAlbumItem';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ListenStorageService } from '../../services/listen-storage.service';

@Component({
  selector: 'app-artist-albums',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './artist-albums.html',
  styleUrls: [ './artist-albums.scss' ]
})
export class ArtistAlbums implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _spotifyService = inject(SpotifyService);
  private readonly _listenStorageService = inject(ListenStorageService);

  protected readonly _searchTerm = signal<string>('');
  protected readonly _isLoading = signal<boolean>(true);
  protected readonly _error = signal<string | null>(null);
  protected readonly _artistId = signal<string | null>(null);
  protected readonly _albums = signal<SpotifyAlbumItem[]>([]);
  protected readonly _showUnlistenedOnly = signal<boolean>(false);
  protected readonly _listenCounts = signal<Record<string, number | undefined>>({});

  protected readonly _filteredAlbums = computed(() => {
    const albums = this._albums();
    const counts = this._listenCounts();
    const showUnlistenedOnly = this._showUnlistenedOnly();
    const searchTerm = this._searchTerm().trim().toLowerCase();

    return albums.filter(album => {
      const matchesListenCount = !showUnlistenedOnly || (counts[ album.id ] ?? 0) === 0;
      const matchesSearch = !searchTerm || album.name.toLowerCase().includes(searchTerm);

      return matchesListenCount && matchesSearch;
    });
  });

  protected readonly _progressPercentage = computed(() => {
    const albums = this._albums();
    const counts = this._listenCounts();

    if (albums.length === 0) {
      return 0;
    }

    const listenedCount = albums.filter(album => (counts[ album.id ] ?? 0) > 0).length;

    return Math.round((listenedCount / albums.length) * 100);
  });

  protected readonly _progressText = computed(() => {
    const albums = this._albums();
    const counts = this._listenCounts();

    if (albums.length === 0) {
      return '0 / 0 listened';
    }

    const listenedCount = albums.filter(album => (counts[ album.id ] ?? 0) > 0).length;

    return `${listenedCount} / ${albums.length} listened`;
  });

  public async ngOnInit(): Promise<void> {
    const artistId = this._route.snapshot.paramMap.get('artistId');

    if (!artistId) {
      this._error.set('No artist was selected.');
      this._isLoading.set(false);
      return;
    }

    this._artistId.set(artistId);

    try {
      const albums = await this._spotifyService.getArtistAlbums(artistId);

      this._albums.set(albums);
      this._listenCounts.set(
        this._listenStorageService.getListenCountsForArtist(artistId)
      );
    } catch {
      this._error.set('Albums could not be loaded.');
    } finally {
      this._isLoading.set(false);
    }

    console.log('Albums loaded:', this._albums());
  }

  protected _updateListenCount(albumId: string, value: string): void {
    const artistId = this._artistId();

    if (!artistId) {
      return;
    }

    const parsedValue = Number(value);
    const listenCount = Number.isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;

    this._listenCounts.update(current => ({
      ...current,
      [ albumId ]: listenCount
    }));

    this._listenStorageService.setListenCount(artistId, albumId, listenCount);
  }

  protected _toggleUnlistenedFilter(): void {
    this._showUnlistenedOnly.update(value => !value);
  }

  protected _updateSearchTerm(value: string): void {
    this._searchTerm.set(value);
  }

  protected _increaseListenCount(albumId: string): void {
    const current = this._listenCounts()[ albumId ] ?? 0;
    this._updateListenCount(albumId, String(current + 1));
  }

  protected _decreaseListenCount(albumId: string): void {
    const current = this._listenCounts()[ albumId ] ?? 0;

    if (current === 0) {
      return;
    }

    this._updateListenCount(albumId, String(current - 1));
  }
}