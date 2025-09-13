export default class VideoState {

    timeStamp : number | undefined
    state: string //unstarted, video cue, buffering, playing, paused, ended -> From youtubes API
    ready: boolean //True or false that will be set if all users are in sync
    playRate: number
    lastUpdated?: number | undefined


    constructor(time: number | undefined, state:string, ready: boolean, playRate:number, lastUpdated?:any){
        this.timeStamp = time
        this.state = state
        this.ready = ready
        this.playRate = playRate
        this.lastUpdated = lastUpdated

        if(lastUpdated && lastUpdated.toDate){
            this.lastUpdated = lastUpdated.toDate().getTime()
        }else if (typeof lastUpdated === "number" ){
            this.lastUpdated = lastUpdated
        }else{
            this.lastUpdated = undefined
        }
    }



    toString() : string{

        return `timeStamp: ${this.timeStamp}, state: ${this.state}, ready:${this.ready}, playRate: ${this.playRate} `

    }


}