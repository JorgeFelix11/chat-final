import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../dashboard.component';
import { NotificationsService } from '../notifications/notifications.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/auth/user.model';
import { FormControl, Validators, FormGroup } from '@angular/forms';

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
  form: FormGroup;
  valid: boolean;

  constructor(
    private notificationsService: NotificationsService,
    public dialogRef: MatDialogRef<GroupForm>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    ngOnInit(){
      this.valid = false;
      this.contacts = this.notificationsService.contacts;
      this.foundContactSub = this.notificationsService.searchContactListener().subscribe(wasFound => {
        this.contact = this.notificationsService.searchedContact
        this.found = wasFound;
      })
      this.form = new FormGroup({
        'groupName': new FormControl(null, {
          validators: [Validators.required, Validators.maxLength(15)]
        }),
        'participant': new FormControl(null, {
          validators: [Validators.email, this.participantsLengthValidator.bind(this)]
        })
      })
    }

  search(){
    this.notificationsService.searchInContacts(this.form.value.participant)
  } 

  addParticipant(){
    this.participants.push(this.contact);
    if(this.participants.length > 1){
      this.valid = true;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
    this.foundContactSub.unsubscribe();
  }

  createGroup(){
    let participantsIds: any[] = [];
    if(this.participants.length > 1){
      this.participants.forEach(element => {
        participantsIds.push({_id: element._id})
      })
      this.notificationsService.createGroupChat(this.form.value.groupName, participantsIds)
      this.onNoClick()
    }
  }

  participantsLengthValidator(control: FormControl): {[s: string]: boolean} {
    if(this.participants.length < 2){
      return {'participantsLength': true};
    }
    return null
  }
}