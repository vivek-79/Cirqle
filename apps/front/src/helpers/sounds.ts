

export enum SOUND_TYPE{
    MESSAGE="MESSAGE",
    REACTION="REACTION"
}

export const newMessageSound=({type}:{type:SOUND_TYPE})=>{

    
    let url;
    switch (type) {
        case SOUND_TYPE.REACTION:
            
            url = "reaction.mp3"
            break;
    
        default:
            url = "new_message.wav"
            break;
    }

    let sound = new Audio(`/sounds/${url}`);

    sound.volume = 0.5;
    if (url === "new_message.wav"){sound.currentTime=0.1;}
    sound.play()
}