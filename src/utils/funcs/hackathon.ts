import { Hackathon } from '@/types';
import moment from 'moment';

export const formatHackathonDate = (input: string | Date): string => {
  const date = typeof input === 'string' ? new Date(input) : input;
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();

  const daySuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  return `${day}${daySuffix(day)} ${month}`;
};

export function getHackathonStatus(hackathon: Hackathon): string {
  const now = moment();

  if (hackathon.isEnded) {
    return 'This hackathon has ended.';
  }

  if (now.isBefore(moment(hackathon.startTime))) {
    return 'Event has not Started.';
  }

  if (now.isBefore(moment(hackathon.teamFormationStartTime))) {
    return 'Event participation is Live.';
  }

  if (now.isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime), null, '[)')) {
    return 'Team formation is Live.';
  }

  for (let i = 0; i < hackathon.rounds.length; i++) {
    const round = hackathon.rounds[i];
    if (now.isBetween(moment(round.startTime), moment(round.endTime), null, '[)')) {
      return `Round ${i + 1} is Live.`;
    }
  }

  if (
    now.isAfter(moment(hackathon.rounds[hackathon.rounds.length - 1].endTime)) &&
    now.isBefore(moment(hackathon.endTime))
  ) {
    return 'All Rounds are completed.';
  }

  return 'All Rounds are completed.';
}
