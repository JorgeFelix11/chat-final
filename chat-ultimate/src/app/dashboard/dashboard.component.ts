import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NotificationsService } from './notifications/notifications.service';
import { User } from '../auth/user.model';
import { Subscription } from 'rxjs';
import { ChatService } from './notifications/chat.service';
import { AuthService } from '../auth/auth.service';
import { MatDialog } from '@angular/material';
import { GroupForm } from './groupForm/groupForm';
import { AddContactForm } from './addContactForm/addContactForm';
import { AddParticipantForm } from './addParticipantForm/addParticipantForm';

export class DialogData {
  groupContacts: User[]
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  buttonClicked: string;
  private foundListenerSubs: Subscription;
  private messageListenerSubs: Subscription;
  private onAddSubs: Subscription;
  private onAcceptanceSubs: Subscription;
  private onMessageSubs: Subscription;
  private onGroupSubs: Subscription;
  private groupMessageListenerSub: Subscription;
  private addListenerSubs: Subscription;
  contactsConv: any[] = [];
  user: User;
  found: boolean;
  contact: User;
  messages: any[] = [];
  conversationId: string = '';
  animal: string;
  name: string;
  contacts: { status: string, emailFriend: string, _id: string }[];
  groups: any[] = [];
  groupContacts: any[] = [];

  constructor(
    private notificationsService: NotificationsService,
    private chatService: ChatService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.user = this.authService.user;
    this.notificationsService.getContacts();
    this.notificationsService.getGroups();
    this.foundListenerSubs = this.notificationsService.foundListener()
      .subscribe(() => {
        this.contacts = this.notificationsService.contacts;
      })

    this.addListenerSubs = this.notificationsService.addListener()
      .subscribe(() => {
        this.contacts = this.notificationsService.contacts;
      })

    this.onGroupSubs = this.notificationsService.groupsListener()
      .subscribe(() => {
        this.groups = this.notificationsService.groups;
      })

    this.onMessageSubs = this.chatService.getMessages().subscribe(message => {
      if (message.conversation === this.conversationId) {
        this.messages.unshift(message.messageObj)
      } else {
      }
    })
    this.onAcceptanceSubs = this.chatService.onAcceptance().subscribe(user => {
      let contactsLength = this.contacts.length
      for (let i = 0; i < contactsLength; i++) {
        if (this.contacts[i]._id === user.userId) {
          this.contacts[i].status = "Accepted";
          this.chatService.joinRoom(user.conversationId)
        }
      }
    })
    this.onAddSubs = this.chatService.onAdd().subscribe(friend => {
      if (friend) {
        this.notificationsService.getContacts()
      }
    })

    this.onGroupSubs = this.chatService.onGroup().subscribe(group => {
      if (group) {
        this.notificationsService.getGroups();
        this.chatService.joinRoom(group.groupConversationId)
      }
    })
  }

  openDialog(): void {
    this.dialog.open(GroupForm, {
      width: '60vw',
      height: '70vh'
    });
  }

  openDialogAdd(): void {
    this.dialog.open(AddContactForm, {
      width: '20vw',
      height: '40vh'
    });
  }

  openDialogAddParticipant(): void {
    this.dialog.open(AddParticipantForm, {
      width: '20vw',
      height: '40vh',
      data: {groupContacts: this.groupContacts}
    });
  }
  onAccept(index) {
    this.notificationsService.acceptRequest(index)
    this.notificationsService.acceptListener()
      .subscribe((contact) => {
        this.contacts = this.notificationsService.contacts;
        this.chatService.joinRoom(contact[0].conversation)
      })
    this.found = false;
  }

  onChat(index) {
    this.notificationsService.chat(index);
    this.groupContacts = [];
    this.messageListenerSubs = this.notificationsService.messagesListener()
      .subscribe(found => {
        this.contactsConv = this.notificationsService.contactsConv.filter(element => element._id !== this.user.id);
        this.messages = this.notificationsService.messages
        this.conversationId = this.notificationsService.conversation;
      })
  }

  onGroupChat(index) {
    this.notificationsService.groupChat(index);
    this.groupContacts = [];
    this.contactsConv = [];
    this.groupMessageListenerSub = this.notificationsService.groupMessagesListener().subscribe(found => {
      this.groupContacts = this.notificationsService.groupContacts;
      this.messages = this.notificationsService.messages;
      this.conversationId = this.notificationsService.conversation
    })
  }

  sendMessage(messageForm: NgForm) {
    let message = messageForm.value.message
    this.chatService.message(message, this.conversationId)
    messageForm.resetForm()
  }

  ngOnDestroy() {
    if (this.addListenerSubs) this.addListenerSubs.unsubscribe();
    if (this.foundListenerSubs) this.foundListenerSubs.unsubscribe();
    if (this.messageListenerSubs) this.messageListenerSubs.unsubscribe();
    if (this.onAcceptanceSubs) this.onAcceptanceSubs.unsubscribe();
    if (this.onAddSubs) this.onAddSubs.unsubscribe();
    if (this.onMessageSubs) this.onMessageSubs.unsubscribe();
    if (this.onGroupSubs) this.onGroupSubs.unsubscribe();
    if (this.groupMessageListenerSub) this.groupMessageListenerSub.unsubscribe();
  }
}
