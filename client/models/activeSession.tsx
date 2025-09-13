export default class ActiveSession {
  title: string;
  hostName: string;
  isPrivate: boolean;
  createdAt: string;
  members: { name: string; role: string }[];

  constructor(
    title: string,
    hostName: string,
    isPrivate: boolean,
    createdAt: string,
    members: { name: string; role: string }[]
  ) {
    this.title = title;
    this.hostName = hostName
    this.isPrivate = isPrivate
    this.createdAt = createdAt;
    this.members = members;
  }
}
