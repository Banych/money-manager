import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs, Dayjs };

export function formatISO(date: Date | string | number): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDateTime(date: Date | string | number): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function formatDateTimeISO(date: Date | string | number): string {
  return dayjs(date).toISOString();
}

export function formatRelative(date: Date | string | number): string {
  return dayjs(date).fromNow();
}

export function formatShort(date: Date | string | number): string {
  return dayjs(date).format('DD MMM');
}

export function daysAgo(date: Date | string | number): number {
  return dayjs().diff(dayjs(date), 'day');
}
