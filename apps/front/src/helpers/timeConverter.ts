import { formatDistanceToNow } from "date-fns";

 //getting hours
 export const hoursAgo = (time: string) => {

    const formatted = formatDistanceToNow(new Date(time));
    const cleaned = formatted.replace(/^(about|over|almost)\s/, "");

    const [valueStr, unit] = cleaned.split(" ");
    const value = Number(valueStr);
    const firstChar = unit[0].toLowerCase();

    let multiplier: number;

    if (firstChar === "m") {
      multiplier = 1 / 60;
    } else if (firstChar === "h") {
      multiplier = 1;
    } else if (firstChar === "d") {
      multiplier = 24;
    } else if (firstChar === "w") {
      multiplier = 24 * 7;
    } else if (firstChar === "m") {
      multiplier = 24 * 30;
    } else if (firstChar === "y") {
      multiplier = 24 * 365;
    } else {
      multiplier = 0;
    }
    return value * multiplier;
  };


  export const getTimeForMessage =({date}:{date:string})=>{

      const time = new Date(date).toLocaleTimeString("en-us",{hour12:false,hour:"2-digit",minute:"2-digit"})
      return time;
  }