import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from 'src/app/auth/user.model';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NotificationsService{
  found: boolean;
  contact: User;
  contacts: any[] = [];
  contactsConv: any[] = [];
  conversation: string;
  messages: any[] = [];
  groups: any[] = [];
  groupContacts: any[] = [];
  searchedContact;
  private contactsArr = new Subject<any[]>();
  private foundStatus = new Subject<boolean>();
  private addStatus = new Subject<any>();
  private acceptStatus = new Subject<any>();
  private messagesStatus = new Subject<any>();
  private searchContactStatus = new Subject<any>();
  private groupsStatus = new Subject<any>();
  private groupsArrStatus = new Subject<any>();
  private groupMessageStatus = new Subject<any>();
  constructor(private http: HttpClient, public router: Router){}

  foundListener(){
    return this.foundStatus.asObservable();
  }

  addListener(){
    return this.addStatus.asObservable();
  }

  acceptListener(){
    return this.acceptStatus.asObservable();
  }

  contactsArrListener(){
    return this.contactsArr.asObservable();
  }

  messagesListener(){
    return this.messagesStatus.asObservable();
  }

  groupMessagesListener(){
    return this.groupMessageStatus.asObservable()
  }

  searchContactListener(){
    return this.searchContactStatus.asObservable();
  }

  groupsListener(){
    return this.groupsStatus.asObservable();
  }

  groupsArrListener(){
    return this.groupsArrStatus.asObservable();
  }

  searchContact(email: string){
    this.http.post<any>('/api/users/search', {email})
      .subscribe(response => {
        console.log(response.user)
        this.contact = response.user;
        this.foundStatus.next(true)
      })
  }

    
  addContact(email: string, status: string){
    const contact = { email, status };
    this.http.post<any>('/api/users/add', contact)
      .subscribe(response => {
        this.contacts = []
        response.contacts.forEach(element => {
          this.contacts.push(element)
        });
        this.addStatus.next(true);
      })
  }

  getContactsForRooms(){
    this.http.get<any>('/api/users/getcontactsdb')
    .subscribe(response => {
      this.contactsArr.next(response.userContacts.contacts)
    })
  }

  getContacts(){    
    this.http.get<any>('/api/users/getcontactsdb')
    .subscribe(response => {
      this.contacts = response.contacts;
      this.foundStatus.next(true);
    })
  }

  acceptRequest(index){
    let contactAccepted = {
      friendId: this.contacts[index]._id
    }    
    this.http.post<{contacts: any[], acceptor: {contacts: any[]}}>('/api/users/accept', contactAccepted)
      .subscribe(async (response) => {
        this.contacts = []
        response.contacts.forEach(element => {
          this.contacts.push(element)
        });
        let friend = await response.acceptor.contacts.filter(contact => contact._id === contactAccepted.friendId)
        this.acceptStatus.next(friend);
      })
  }

  chat(index){
    this.http.post<any>('/api/users/chat', {friendId: this.contacts[index]._id})
      .subscribe(response => {
        this.messages = response.conversation.messages.filter(message => response.contacts.find(contact => {
          if(message._id === contact._id){
            message.contact = contact.email
            return true;
          }else{
            return false;
          }
        }));
        this.contactsConv = response.contacts
        this.conversation = response.conversation._id
        this.messagesStatus.next(true);
      })
  }

  groupChat(index){
    this.http.post<any>('/api/users/chat', {groupId: this.groups[index]._id})
    .subscribe(response => {
      this.groupContacts = response.contacts;
      this.messages = response.conversation.messages.filter(message => response.contacts.find(contact => {
        if(message._id === contact._id){
          message.contact = contact.email
          return true;
        }else{
          return false;
        }
      }));
      this.conversation = response.conversation._id
      this.groupMessageStatus.next(true);
    })
  }

  searchInContacts(email){
    let participant = this.contacts.filter(contact => contact.email === email);
    if(participant.length > 0 && participant[0].status !== "Pending"){
      this.searchedContact = participant[0]
      this.searchContactStatus.next(true)
    }
  }

  getGroups(){
    this.http.get<any>('/api/users/getgroups')
      .subscribe(response => {
        this.groups = response.conversationInfo;
        this.groupsStatus.next(response.conversationInfo)
      })
  }
  getGroupsForRooms(){
    this.http.get<any>('/api/users/getgroups')
    .subscribe(response => {
      this.groupsArrStatus.next(response.conversationInfo)
    })
  }
  createGroupChat(name, participants){
    this.http.post<any>('/api/users/create-group', {name, participants})
      .subscribe(response => {
      })
  }

}