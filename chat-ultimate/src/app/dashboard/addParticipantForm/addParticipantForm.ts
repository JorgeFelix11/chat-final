import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../dashboard.component';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/auth/user.model';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'addParticipantForm',
  templateUrl: 'addParticipantForm.html',
  styleUrls: ['./addParticipantForm.css']
})
export class AddParticipantForm implements OnInit {
  buttonClicked: string;
  private foundContactSub: Subscription;
  participants: any[] = [];
  private foundListenerSubs: Subscription;
  found: boolean;
  contact: User;
  contacts: User[] = []
  groupContacts: User[] = [];


  constructor(
    private notificationsService: NotificationsService,
    public dialogRef: MatDialogRef<AddParticipantForm>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
    this.contacts = this.notificationsService.contacts;
    this.groupContacts = this.data.groupContacts
    this.foundContactSub = this.notificationsService.searchContactListener().subscribe(wasFound => {
      this.contact = this.notificationsService.searchedContact
      this.found = wasFound;
    })
  }

  onAddContact(addContactForm: NgForm) {
    if (this.buttonClicked == 'search') {
      if (this.groupContacts.find(contact => contact.email === addContactForm.value.email) !== undefined) {
        console.log(`Participant already in the conversation`)
      }else{
        console.log(`Everything good to add`)
      }
      // this.notificationsService.searchContact(addContactForm.value.email)
      // this.foundListenerSubs = this.notificationsService.foundListener()
      //   .subscribe(wasFound => {
      //     this.found = wasFound;
      //     this.contact = this.notificationsService.contact;
      //   })

    } else if (this.buttonClicked == 'add') {
      this.notificationsService.addContact(this.contact.email, "Invited")
      this.found = false;
      this.onNoClick();
      addContactForm.resetForm()
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
    this.foundContactSub.unsubscribe();
    this.foundListenerSubs.unsubscribe();
  }

}