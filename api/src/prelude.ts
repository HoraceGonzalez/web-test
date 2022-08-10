
export function roundDateTime(d:Date, mins:number) : Date {
  const millis = mins * 60 * 1000;
  const roundedTs = Math.ceil(d.getTime() / millis) * millis;
  return new Date(roundedTs);
}