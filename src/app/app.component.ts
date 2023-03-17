import { Component, ApplicationRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { Metrika } from 'ng-yandex-metrika';
import { Location } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent {
  title = 'uncle-razor';

  constructor(
    private metrika: Metrika,
    private router: Router,
    location: Location,
    private _ref: ApplicationRef, private _router: Router,
  ) {
    let prevPath = location.path();
    this.router.events.subscribe((event) => {
        _ref.tick();
        if (event instanceof NavigationEnd) {
          const newPath = location.path();
          this.metrika.hit(newPath, {
            referer: prevPath,
          });
          prevPath = newPath;
        }
      });
  }
}
