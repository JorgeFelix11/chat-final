import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLogged = false;
  private authListenerSubs: Subscription
  constructor(private authService: AuthService, private router: Router) { }
  
  ngOnInit() {
    this.authListenerSubs = this.authService.authListener()
    .subscribe(isAuthenticated => {
      this.isLogged = isAuthenticated;
    })
  }
  onLogout(){
    this.authService.logout();
  }

  loginOrDashboard(){
    if(this.isLogged){
      this.router.navigate(['/dashboard'])      
    }else{
      this.router.navigate(['/login'])
    }
  }
  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe()
  }
}
