import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';
import { AuthData } from './auth-data.model';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { NotificationsService } from '../dashboard/notifications/notifications.service';
import { ChatService } from '../dashboard/notifications/chat.service';

@Injectable({providedIn: 'root'})
export class AuthService{
  user: User;
  private groupsArrStatusListener: Subscription;
  private contactsArrStatusListener: Subscription;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  constructor(
    private http: HttpClient, 
    public router: Router, 
    private notificationsService: NotificationsService, 
    private chatService: ChatService
  ){}

  signup(email: string, username: string, password: string, image: File){
    let userData = new FormData();
    userData.append('email', email);
    userData.append('username', username);
    userData.append('password', password);
    userData.append('image', image, username);
    
    this.http.post<any>('/api/users/signup', userData)
      .subscribe(response => {
        this.router.navigate(['/'])
      })
  }

  authListener(){
    return this.authStatusListener.asObservable();
  }

  login(email: string, password: string){
    const authData: AuthData = { email, password }
    this.http.post<{message: string, contacts: [{email: string, imagePath: string, username: string}], user: {id: string, email: string, username: string, imagePath: string}}>('/api/users/login', authData)
    .subscribe(response => {
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.user = response.user;
      this.chatService.joinRoom(response.user.id)
      this.notificationsService.getContactsForRooms();
      this.contactsArrStatusListener = this.notificationsService.contactsArrListener().subscribe(contacts => {
        contacts.forEach(element => {
          if(element.status === "Accepted"){
            this.chatService.joinRoom(element.conversation)
          }
        });
      })
      this.notificationsService.getGroupsForRooms();
      this.groupsArrStatusListener = this.notificationsService.groupsArrListener().subscribe(groups => {
        groups.forEach(group => {
          this.chatService.joinRoom(group._id)
        });
      })



      this.router.navigate(['/dashboard']);
      })
  }

  logout(){
    this.http.post('/api/users/logout', {message: 'logging out'})
      .subscribe(response => {
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.notificationsService.contacts = []
        this.contactsArrStatusListener.unsubscribe()
        this.groupsArrStatusListener.unsubscribe()
        this.router.navigate(['/login'])
      })
  }

  isLogged(){
    this.http.post<{message: string, user: {id: string, email: string, username: string, imagePath: string}}>('/api/users/info', {})
      .subscribe((response) => {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);      
        this.notificationsService.getContactsForRooms();
        this.chatService.joinRoom(response.user.id)
        this.contactsArrStatusListener = this.notificationsService.contactsArrListener().subscribe(contacts => {
          contacts.forEach(element => {
            if(element.status === "Accepted"){
              this.chatService.joinRoom(element.conversation)
            }
          });
        })
        this.notificationsService.getGroupsForRooms();
        this.groupsArrStatusListener = this.notificationsService.groupsArrListener().subscribe(groups => {
          groups.forEach(group => {
            this.chatService.joinRoom(group._id)
          });
        })
        this.router.navigate(['/dashboard']);
        this.user = response.user;
      })
  }

  isUserAuthenticated(){
    return this.isAuthenticated;
  }
}