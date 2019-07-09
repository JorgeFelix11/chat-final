import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit() {
  }

  onLogin(loginForm: NgForm){
    if(loginForm.invalid){
      return
    }
    this.authService.login(loginForm.value.email, loginForm.value.password)
    
  }
}
