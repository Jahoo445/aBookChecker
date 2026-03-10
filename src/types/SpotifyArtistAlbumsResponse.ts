import { SpotifyAlbumItem } from "./SpotifyAlbumItem";

export type SpotifyArtistAlbumsResponse = {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyAlbumItem[];
};