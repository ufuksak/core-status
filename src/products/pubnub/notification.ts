import { PushNotificationDto } from "../dto/pushnotification.dto";

export class PubnubNotification implements PushNotificationDto {
  public title: string;
  public message: string;
  public domain: string;
  public type: string;
  public from: string;
  public targets: string[];
  public data: Object;
  public streamId: string;

  constructor() {}

  public setTitle(value: string) {
    this.title = value;
    return this;
  }

  public setMessage(value: string) {
    this.message = value;
    return this;
  }

  public setDomain(value: string) {
    this.domain = value;
    return this;
  }

  public setFrom(value: string) {
    this.from = value;
    return this;
  }

  public setTargets(values: string[]) {
    this.targets = values;
    return this;
  }

  public setType(value: string) {
    this.type = value;
    return this;
  }

  public setData(value: Object) {
    this.data = value;
    return this;
  }

  public setStreamId(value: string) {
    this.streamId = value;
    return this;
  }
}
