export function formatCountdown({
  minutes,
  seconds,
}: {
  minutes: number;
  seconds: number;
}) {
  const minutesString = minutes < 10 ? `0${minutes}` : minutes;
  const secondsString = seconds < 10 ? `0${seconds}` : seconds;
  return `${minutesString}:${secondsString}`;
}
