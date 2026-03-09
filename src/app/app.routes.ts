import { Routes } from '@angular/router';
import { ListSelection } from './list-selection/list-selection';
import { ArtistAlbums } from './artist-albums/artist-albums';

export const routes: Routes = [
    {
        path: '',
        component: ListSelection
    },
    {
        path: 'artist/:artistId',
        component: ArtistAlbums
    }
];
