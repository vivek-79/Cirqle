import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

export const hoursAgo = (time: Date | string): number => {
  const now = new Date();
  const date = new Date(time);

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) return minutes / 60;

  const hours = differenceInHours(now, date);
  if (hours < 24) return hours;

  const days = differenceInDays(now, date);
  if (days < 7) return days * 24;

  const weeks = differenceInWeeks(now, date);
  if (weeks < 4) return weeks * 7 * 24;

  const months = differenceInMonths(now, date);
  if (months < 12) return months * 30 * 24;

  const years = differenceInYears(now, date);
  return years * 365 * 24;
};


  export const getTimeForMessage =({date}:{date:Date})=>{

      const time = new Date(date).toLocaleTimeString("en-us",{hour12:false,hour:"2-digit",minute:"2-digit"})
      return time;
  }