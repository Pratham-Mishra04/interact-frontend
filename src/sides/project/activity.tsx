import { SidePrimeWrapper } from '@/wrappers/side';
import React from 'react';
import Loader from '@/components/common/loader';
import Created from '@/components/history/project/created';
import Deleted from '@/components/history/project/deleted';
import Edited from '@/components/history/project/edited';
import Membership from '@/components/history/project/membership';
import History from '@/sections/workspace/history';
import { Project } from '@/types';
import Image from 'next/image';
const Activity = ({ project }: { project: Project }) => {
  return (
    <SidePrimeWrapper>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <div className="text-lg font-medium">Activity</div>
          <History project={project} />
        </div>
        <div className="w-full flex flex-col gap-2">
          {project.history && project.history.length > 0 ? (
            project.history.map(history => {
              switch (history.historyType) {
                case -1:
                case 3:
                case 8:
                case 9:
                  return <Created history={history} />;
                case 0:
                case 1:
                case 6:
                case 7:
                case 10:
                case 11:
                  return <Membership history={history} />;
                case 2:
                case 4:
                case 13:
                  return <Edited history={history} />;
                case 5:
                case 12:
                  return <Deleted history={history} />;
                default:
                  return <></>;
              }
            })
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center my-4 space-y-2">
              <Image src="/assets/new_activity.svg" alt="no activity" width={150} height={150} className="mx-auto" />
              <div className="text-white/80 text-md font-semibold font-['DM Sans'] tracking-tight">
                Nothing Here. Get Started!
              </div>
            </div>
          )}
        </div>
      </div>
    </SidePrimeWrapper>
  );
};

export default Activity;
