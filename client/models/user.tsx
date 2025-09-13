export default class User {
  id: string;
  userName: string;
  email: string;
  password: string;

  //Constructor
  constructor(id: string, userName: string, email: string, password: string) {
    this.id = id;
    this.userName = userName;
    this.email = email;
    this.password = password;
  }

  //Gets entire user object
  getUser(): User {
    return this;
  }

  //Gets user profile only, this will be used for a public profile. Might add profile picture later.
  getUserProfile(): string[] {
    return [this.userName];
  }

  //Ability to update the user
  setUser(user: User): void {
    this.userName = user.userName;
    this.email = user.email;
  }
}
