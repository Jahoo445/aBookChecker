import { Component, OnInit, inject, signal } from '@angular/core';
import { AudiobookService } from '../../services/audiobook';


type AudiobookArtist = {
  artistName: string;
  artistId: string;
};

@Component({
  selector: 'app-list-selection',
  standalone: true,
  templateUrl: './list-selection.html',
  styleUrls: ['./list-selection.scss']
})
export class ListSelection implements OnInit {
  private readonly _audiobookService = inject(AudiobookService);

  protected readonly _audiobooks = signal<AudiobookArtist[]>([]);
  protected readonly _isLoading = signal<boolean>(true);
  protected readonly _error = signal<string | null>(null);

  public async ngOnInit(): Promise<void> {
    try {
      const audiobooks = await this._audiobookService.getAudiobookArtists();
      this._audiobooks.set(audiobooks);
    } catch {
      this._error.set('Audiobooks could not be loaded.');
    } finally {
      this._isLoading.set(false);
    }
  }

  protected _selectAudiobook(audiobook: AudiobookArtist): void {
    console.log('Selected audiobook:', audiobook);
  }
}