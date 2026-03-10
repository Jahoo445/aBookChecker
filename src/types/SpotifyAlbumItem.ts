import { SpotifyAlbumArtist } from "./SpotifyAlbumArtist";
import { SpotifyImage } from "./SpotifyImage";


export type SpotifyAlbumItem = {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: 'year' | 'month' | 'day';
  restrictions?: {
    reason: string;
  };
  type: 'album';
  uri: string;
  artists: SpotifyAlbumArtist[];
  album_group: string;
};
