


export const newMessageSound=()=>{
    const sound = new Audio("/sounds/new_message.wav");

    sound.volume = 0.5;
    sound.currentTime=0.1;
    sound.play()
}