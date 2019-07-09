import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../dashboard.component';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription, Subject } from 'rxjs';
import { User } from 'src/app/auth/user.model';

@Component({
  selector: 'groupForm',
  templateUrl: 'groupForm.html',
  styleUrls: ['./groupForm.css']
})
export class GroupForm implements OnInit{
  buttonClicked: string;
  private foundContactSub: Subscription;
  participants: any[] = [];
  found: boolean;
  contact: User;
  contacts: User[] = []

  constructor(
    private notificationsService: NotificationsService,
    public dialogRef: MatDialogRef<GroupForm>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit(){
      this.contacts = this.notificationsService.contacts;
      this.foundContactSub = this.notificationsService.searchContactListener().subscribe(wasFound => {
        this.contact = this.notificationsService.searchedContact
        this.found = wasFound;
      })
    }

  search(email){
    this.notificationsService.searchInContacts(email.value)
  } 

  addParticipant(){
    this.participants.push(this.contact);
  }

  onNoClick(): void {
    this.dialogRef.close();
    this.foundContactSub.unsubscribe();
  }

  createGroup(nameGroup){
    let participantsIds: any[] = [];
    if(this.participants.length > 1){
      this.participants.forEach(element => {
        participantsIds.push({_id: element._id})
      })
      this.notificationsService.createGroupChat(nameGroup.value, participantsIds)
      this.onNoClick()
    }else{
      console.log('not enough participants')
    }
  }
}