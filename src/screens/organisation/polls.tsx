import Loader from '@/components/common/loader';
import Mascot from '@/components/fillers/mascot';
import PollCard from '@/components/organization/poll_card';
import { ORG_SENIOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { useOrgAccess } from '@/hooks/use-org-access';
import NewPoll from '@/sections/organization/polls/new_poll';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Poll } from '@/types';
import { initialOrganization } from '@/types/initials';
import Toaster from '@/utils/toaster';
import { Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Polls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [organisation, setOrganisation] = useState(initialOrganization);
  const [loading, setLoading] = useState(true);

  const [clickedOnNewPoll, setClickedOnNewPoll] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const getPolls = () => {
    const URL = `${ORG_URL}/${currentOrg.id}/polls`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          setPolls(res.data.polls || []);
          setOrganisation(res.data.organization);
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getPolls();
  }, []);

  const isSenior = useOrgAccess(ORG_SENIOR);

  return (
    <div className="w-full py-4">
      {clickedOnNewPoll && (
        <NewPoll orgID={currentOrg.id} setPolls={setPolls} organisation={organisation} setShow={setClickedOnNewPoll} />
      )}
      {isSenior && !clickedOnNewPoll && (
        <div
          className="fixed z-10 bottom-28 right-2 lg:bottom-12 lg:right-12 flex-center text-sm bg-primary_text text-white px-4 py-3 rounded-full flex gap-2 shadow-lg hover:shadow-2xl font-medium cursor-pointer animate-fade_third transition-ease-300"
          onClick={() => setClickedOnNewPoll(true)}
        >
          <Plus size={20} /> <div className="h-fit">Add Poll</div>
        </div>
      )}
      {loading ? (
        <Loader />
      ) : (
        <div className="w-4/5 max-md:w-full mx-auto pb-base_padding flex flex-col gap-4">
          {polls?.length > 0 ? (
            polls.map(poll => (
              <PollCard key={poll.id} poll={poll} setPolls={setPolls} organisation={organisation} isSenior={isSenior} />
            ))
          ) : (
            <Mascot
              message={
                <div className="flex flex-col items-center">
                  <div>There are no polls available at the moment.</div>
                  {isSenior && (
                    <div className="text-sm">Add a Poll now to gather feedback or to ask a fun question!</div>
                  )}
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Polls;
