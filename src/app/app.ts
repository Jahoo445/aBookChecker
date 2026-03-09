import { RouterOutlet } from '@angular/router';
import { Component, signal } from '@angular/core';
import { ListSelection } from './list-selection/list-selection';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('aBookChecker');
}
