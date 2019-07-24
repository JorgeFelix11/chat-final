import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class ChatService{
  private socket: Socket;

  constructor(private http: HttpClient, public router: Router){
    this.socket = io();
  }

  message(message: string, conversation: string){
    this.http.post("/api/users/message", {message, conversation})
    .subscribe(response => {})
  }

  joinRoom(id: string){
    this.socket.emit('join', id)
  }
  
  onGroup(){
    return Observable.create((observer) => {
      this.socket.on('group', (groupConvId) => {
        observer.next(groupConvId)
      })
    })
  }

  onAcceptance(){
    return Observable.create((observer) => {
      this.socket.on('accept', (user) => {
        observer.next(user)
      })
    })
  }

  onAdd(){
    return Observable.create((observer) => {
      this.socket.on('add-contact', (friend) => {
        observer.next(friend);
      })
    })
  }

  getMessages(){
    return Observable.create((observer) => {
      this.socket.on('message', (message) => {
        observer.next(message)
      })
    })
  }

}