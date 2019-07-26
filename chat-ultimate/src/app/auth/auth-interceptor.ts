import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authRequest = req.clone({
      withCredentials: true
    })
    return next.handle(authRequest)
    // .pipe(
    //   map((event: HttpEvent<any>) => {
    //     if (event instanceof HttpResponse) {
    //       console.log('event ----->>', event)
    //     }
    //     return event;
    //   }),
    //   catchError((error: HttpErrorResponse) => {
    //     let data = {};
    //     data = {
    //       reason: error.error.message,
    //       status: error.status
    //     }
    //     console.log(data);
    //     return throwError(error)
    //   })
    // )
  }
// cd usr/local/bin/robo3t/bin

}