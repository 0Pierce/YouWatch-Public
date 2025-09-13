import VideoState from './videoState';

export default class Session {
  //Fields
  sessionID: string; //Primary key
  sName: string; //Session name (title)
  hostName: string; //Name of host
  hostID: string; //Users id from auth
  sPassword?: string; //password for a private session
  videoID?: string; //Current video - Might expand into array later for vid queue or make new field
  videoState? : VideoState //Object that holds information of video state





  constructor(seshID:string, sName: string, hName: string, hostID: string,  pass?: string, videoID?: string, videoState?: VideoState){
    this.sessionID = seshID
    this.sName = sName
    this.hostName = hName
    this.hostID = hostID
    this.sPassword = pass
     this.videoID = videoID
    this.videoState = videoState
  }


  toString() : string{

    return(`SessionID: ${this.sessionID}, SessionName: ${this.sName}, HostName: ${this.hostName}, UserID: ${this.hostID}, password:Hidden, VideoID: ${this.videoID}, VideoState: ${this.videoState}`)

  }

  //Getters&Setters
}
