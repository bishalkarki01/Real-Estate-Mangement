import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private metaDefault: any = {};

  setMetaDefault(metaDefault: any) {
    this.metaDefault = metaDefault;
    console.log(metaDefault);
  }

  getMetaDefault(): any {
    return this.metaDefault;
  }
}
