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

  // Case 1: Hackathon has ended
  if (hackathon.isEnded) {
    return 'This hackathon has ended.';
  }

  // Case 2: Hackathon has not started yet
  if (now.isBefore(moment(hackathon.startTime))) {
    return 'Event has not started yet.';
  }

  // Case 3: Participation phase
  if (now.isBefore(moment(hackathon.teamFormationStartTime))) {
    return 'Event participation is live.';
  }

  // Case 4: Team formation phase
  if (now.isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime), null, '[)')) {
    return 'Team formation is live.';
  }

  // Case 5: After team formation but before Round 1
  if (
    hackathon.rounds.length > 0 &&
    now.isAfter(moment(hackathon.teamFormationEndTime)) &&
    now.isBefore(moment(hackathon.rounds[0].startTime))
  ) {
    return 'Team formation has ended.';
  }

  // Case 6: During Rounds
  for (let i = 0; i < hackathon.rounds.length; i++) {
    const round = hackathon.rounds[i];
    if (now.isBetween(moment(round.startTime), moment(round.endTime), null, '[)')) {
      return `Round ${i + 1} is live.`;
    }

    // Case 7: Between rounds
    if (
      i < hackathon.rounds.length - 1 &&
      now.isAfter(moment(round.endTime)) &&
      now.isBefore(moment(hackathon.rounds[i + 1].startTime))
    ) {
      return `Round ${i + 1} has ended,`;
    }
  }

  // Case 8: Post-rounds but before hackathon end
  const lastRoundEndTime = moment(hackathon.rounds[hackathon.rounds.length - 1]?.endTime);
  if (lastRoundEndTime.isValid() && now.isAfter(lastRoundEndTime) && now.isBefore(moment(hackathon.endTime))) {
    return 'All rounds are completed.';
  }

  // Default: Hackathon has ended or unexpected state
  return 'This hackathon has ended.';
}
