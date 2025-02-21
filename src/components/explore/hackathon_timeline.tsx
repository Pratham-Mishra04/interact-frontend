import { Check } from '@phosphor-icons/react';
import moment from 'moment';
import React from 'react';

interface Timeline {
  title: string;
  timestamp: moment.Moment;
}

const HackathonTimeline = ({ timeline }: { timeline: Timeline[] }) => {
  const now = moment();

  // Count completed events
  const completedEvents = timeline.filter(t => now.isAfter(t.timestamp)).length;
  const totalEvents = timeline.length;
  const progressHeight = totalEvents > 1 ? (completedEvents / totalEvents) * 100 : 0;

  return (
    <div className="w-full h-full space-y-6 relative">
      {timeline.map((t, i) => {
        const isCompleted = now.isAfter(t.timestamp);
        const isOngoing = now.isBetween(timeline[i - 1]?.timestamp || now.subtract(1, 'hour'), t.timestamp);

        return (
          <div key={i} className="w-full flex items-center gap-4">
            <div className="flex-center relative">
              <div className={`w-8 h-8 ${isCompleted ? 'bg-blue-300' : 'bg-gray-200'} rounded-full z-10 flex-center`}>
                {isCompleted && <Check className="text-primary_text" weight="bold" />}
              </div>
              {isOngoing && (
                <div className={`w-8 h-8 bg-blue-300 rounded-full animate-pulse absolute top-0 right-0 z-20`}></div>
              )}
            </div>
            <div className="grow flex md:items-center max-md:flex-col md:gap-2">
              <div className="text-lg font-medium">{t.title}:</div>
              <div className="text-gray-500 text-sm flex items-center gap-2">
                <div>{t.timestamp.format('DD MMM, h:mm A')}</div>
                <div className="text-xs max-md:hidden">({t.timestamp.fromNow()})</div>
              </div>
            </div>
          </div>
        );
      })}
      {/* Static full timeline line */}
      <div className="w-1 h-[calc(100%-16px)] bg-primary_comp absolute -top-4 left-3.5"></div>
      {/* Dynamic progress bar */}
      <div
        className="w-1 bg-primary_comp_active absolute -top-4 left-3.5 transition-all duration-500"
        style={{
          height: progressHeight === 100 ? `calc(100% - 16px)` : `${progressHeight}%`,
        }}
      ></div>
    </div>
  );
};

export default HackathonTimeline;
