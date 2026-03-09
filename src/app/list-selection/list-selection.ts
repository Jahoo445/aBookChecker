import { SpotifyService } from '../../services/spotify';
import { AudiobookService } from '../../services/audiobook';
import { Component, OnInit, inject, signal } from '@angular/core';


type AudiobookArtist = {
  artistName: string;
  artistId: string;
};

type AudiobookArtistWithImage = {
  artistName: string;
  artistId: string;
  imageUrl: string | null;
};

@Component({
  selector: 'app-list-selection',
  standalone: true,
  templateUrl: './list-selection.html',
  styleUrls: [ './list-selection.scss' ]
})
export class ListSelection implements OnInit {
  private readonly _audiobookService = inject(AudiobookService);
  private readonly _spotifyService = inject(SpotifyService);

  protected readonly _audiobooks = signal<AudiobookArtistWithImage[]>([]);
  protected readonly _isLoading = signal<boolean>(true);
  protected readonly _error = signal<string | null>(null);

  public async ngOnInit(): Promise<void> {
    try {
      const audiobooks = await this._audiobookService.getAudiobookArtists();

      const audiobooksWithImages = await Promise.all(
        audiobooks.map(async (audiobook: AudiobookArtist) => {
          const artist = await this._spotifyService.getArtist(audiobook.artistId);

          return {
            artistName: audiobook.artistName,
            artistId: audiobook.artistId,
            imageUrl: artist.images[ 0 ]?.url ?? null
          };
        })
      );

      this._audiobooks.set(audiobooksWithImages);
    } catch {
      this._error.set('Audiobooks could not be loaded.');
    } finally {
      this._isLoading.set(false);
    }
  }

  protected _selectAudiobook(audiobook: AudiobookArtistWithImage): void {
    console.log('Selected audiobook:', audiobook);
  }
}