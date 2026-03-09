export type SpotifyAlbum = {
  id: string;
  name: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
  release_date: string;
};
