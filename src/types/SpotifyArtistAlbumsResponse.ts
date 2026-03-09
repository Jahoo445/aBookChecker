import { SpotifyAlbum } from '../types/SpotifyAlbum';

export interface SpotifyArtistAlbumsResponse {
  items: SpotifyAlbum[];
  total: number;
}
