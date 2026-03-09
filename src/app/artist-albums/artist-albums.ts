import { SpotifyService } from '../../services/spotify';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ListenStorageService } from '../../services/listen-storage';
import { Component, OnInit, inject, signal, computed } from '@angular/core';


type SpotifyAlbum = {
  id: string;
  name: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  release_date: string;
};

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

  protected readonly _isLoading = signal<boolean>(true);
  protected readonly _error = signal<string | null>(null);
  protected readonly _albums = signal<SpotifyAlbum[]>([]);
  protected readonly _artistId = signal<string | null>(null);
  protected readonly _showUnlistenedOnly = signal<boolean>(false);
  protected readonly _listenCounts = signal<Record<string, number | undefined>>({});

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

      const filteredAlbums = albums.filter(album =>
        /^(Folge|\d+)/i.test(album.name)
      );

      this._albums.set(filteredAlbums);
      this._listenCounts.set(
        this._listenStorageService.getListenCountsForArtist(artistId)
      );
    } catch {
      this._error.set('Albums could not be loaded.');
    } finally {
      this._isLoading.set(false);
    }
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

  protected readonly _filteredAlbums = computed(() => {
    const albums = this._albums();
    const counts = this._listenCounts();
    const showUnlistened = this._showUnlistenedOnly();

    if (!showUnlistened) {
      return albums;
    }

    return albums.filter(album => (counts[ album.id ] ?? 0) === 0);
  });

  protected _toggleUnlistenedFilter(): void {
    this._showUnlistenedOnly.update(value => !value);
  }
}