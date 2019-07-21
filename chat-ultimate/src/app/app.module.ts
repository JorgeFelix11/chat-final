import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatToolbarModule, MatButtonModule, MatInputModule, MatCardModule, MatExpansionModule, MatDialogModule } from '@angular/material'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthInterceptor } from './auth/auth-interceptor';
import { InfoComponent } from './info/info.component';
import { ChatService } from './dashboard/notifications/chat.service';
import { GroupForm } from './dashboard/groupForm/groupForm';
import { AddContactForm } from './dashboard/addContactForm/addContactForm';
import { AddParticipantForm } from './dashboard/addParticipantForm/addParticipantForm';
import { GravatarModule } from  'ngx-gravatar';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    InfoComponent,
    GroupForm,
    AddContactForm,
    AddParticipantForm
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatExpansionModule,
    MatDialogModule,
    GravatarModule
  ],
  entryComponents: [GroupForm, AddContactForm, AddParticipantForm],
  providers: [ChatService, {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
