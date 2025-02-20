import BaseWrapper from '@/wrappers/base';
import OrgSidebar from '@/components/common/org_sidebar';
import MainWrapper from '@/wrappers/main';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useState, useEffect, useMemo } from 'react';
import NewMeeting from '@/sections/organization/meetings/new_meeting';
import { ArrowCounterClockwise, Info, LockOpen, Plus, SortAscending } from '@phosphor-icons/react';
import { ORG_SENIOR } from '@/config/constants';
// import NoMeetings from '@/components/fillers/meetings';
import MeetingCard from '@/components/organization/meeting_card';
import { Meeting } from '@/types';
import Toaster from '@/utils/toaster';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import InfiniteScroll from 'react-infinite-scroll-component';
import AccessTree from '@/components/organization/access_tree';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import Mascot from '@/components/fillers/mascot';
import Select from '@/components/filters/select';
import Order from '@/components/filters/order';
import Tags from '@/components/filters/tags';
import { useOrgAccess } from '@/hooks/use-org-access';

const Meetings = () => {
  const [loading, setLoading] = useState(true);
  const [clickedOnNewMeeting, setClickedOnNewMeeting] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [order, setOrder] = useState('next_session_time');
  const [frequency, setFrequency] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const isSenior = useOrgAccess(ORG_SENIOR);

  const getMeetings = async (initialPage: number | null) => {
    const URL = `/org/${currentOrg.id}/meetings?page=${
      initialPage ? initialPage : page
    }&limit=${10}&order=${order}&frequency=${frequency == 'one_time' ? 'none' : frequency}&tags=${tags.join(
      ','
    )}&is_open_for_members=${status == '' ? status : status == 'open'}`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode === 200) {
      if (initialPage == 1) {
        setMeetings(res.data.meetings || []);
      } else {
        const addedMeetings = [...meetings, ...(res.data.meetings || [])];
        if (addedMeetings.length === meetings.length) setHasMore(false);
        setMeetings(addedMeetings);
      }
      setPage(prev => prev + 1);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    setPage(1);
    setMeetings([]);
    setHasMore(true);
    setLoading(true);
    getMeetings(1);
  }, [order, status, frequency, tags]);

  return (
    <BaseWrapper title={`Meetings | ${currentOrg.title}`}>
      <OrgSidebar index={16} />
      <MainWrapper>
        {clickedOnNewMeeting && <NewMeeting setShow={setClickedOnNewMeeting} setMeetings={setMeetings} />}
        {clickedOnInfo && <AccessTree type="meeting" setShow={setClickedOnInfo} />}
        <div className="w-full flex justify-between items-center p-base_padding">
          <div className="flex-center gap-4">
            <div className="w-fit text-6xl max-md:text-4xl font-semibold dark:text-white font-primary ">Meetings</div>
            <div className="flex-center gap-2 max-md:hidden">
              <Select
                fieldName="Access"
                options={['open', 'restricted']}
                icon={<LockOpen size={20} />}
                selectedOption={status}
                setSelectedOption={setStatus}
              />
              <Select
                fieldName="Frequency"
                options={['one_time', 'daily', 'weekly', 'monthly']}
                icon={<ArrowCounterClockwise size={20} />}
                selectedOption={frequency}
                setSelectedOption={setFrequency}
              />
              <Order
                fieldName="Sort By"
                options={['next_session_time', 'latest']}
                icon={<SortAscending size={20} />}
                selectedOption={order}
                setSelectedOption={setOrder}
              />
              <Tags selectedTags={tags} setSelectedTags={setTags} />
              {/* <Search /> */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSenior && (
              <Plus
                onClick={() => setClickedOnNewMeeting(prev => !prev)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            )}
            <Info
              onClick={() => setClickedOnInfo(true)}
              size={42}
              className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
              weight="regular"
            />
          </div>
        </div>

        <div
          className="w-[calc(100%-48px)] h-16 max-md:h-12 bg-white dark:bg-dark_primary_comp rounded-xl mx-auto border-gray-400 dark:border-dark_primary_btn flex font-semibold text-primary_black dark:text-white
         mb-2"
        >
          <div className="w-1/6 max-md:w-1/3 flex-center">Title</div>
          <div className="w-1/6 max-md:w-1/3 flex-center">Status</div>
          <div className="w-1/6 max-md:hidden flex-center">Tags</div>
          <div className="w-1/6 max-md:hidden flex-center">Frequency</div>
          <div className="w-1/6 max-md:w-1/3 flex-center">Access</div>
          <div className="w-1/6 max-md:hidden flex-center">Details</div>
        </div>

        {loading ? (
          <Loader />
        ) : meetings.length > 0 ? (
          <InfiniteScroll
            dataLength={meetings.length}
            next={() => getMeetings(null)}
            hasMore={hasMore}
            loader={<Loader />}
            className="w-full flex flex-col gap-2 px-base_padding pt-2 pb-6"
          >
            {meetings.map(meeting => {
              return <MeetingCard key={meeting.id} meeting={meeting} />;
            })}
          </InfiniteScroll>
        ) : (
          <Mascot message="No meetings scheduled yet." />
        )}
      </MainWrapper>
    </BaseWrapper>
  );
};

export default OrgMembersOnlyAndProtect(Meetings);
