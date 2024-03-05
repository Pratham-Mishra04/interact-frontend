import { useEffect, useState } from 'react';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Opening } from '@/types';
import OpeningCard from '@/components/explore/opening_card';
import NewOpening from '@/sections/organization/openings/new_opening';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { initialOpening } from '@/types/initials';
import OpeningView from '@/sections/explore/opening_view';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '@/components/common/loader';
import Mascot from '@/components/empty_fillers/mascot';
import { EXPLORE_URL } from '@/config/routes';
import { useWindowWidth } from '@react-hook/window-size';

interface Props {
  orgID: string;
}

export default function Openings({ orgID }: Props) {
  const [clickedOnNewOpening, setClickedOnNewOpening] = useState(false);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [clickedOnOpening, setClickedOnOpening] = useState(false);
  const [clickedOpening, setClickedOpening] = useState(initialOpening);

  const windowWidth = useWindowWidth();

  const fetchOpenings = async () => {
    const URL = `${EXPLORE_URL}/openings/org/${orgID}?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const addedOpenings = [...openings, ...(res.data.openings || [])];
      if (addedOpenings.length === openings.length) setHasMore(false);
      setOpenings(addedOpenings);

      if (clickedOnOpening && page == 1) {
        if (addedOpenings.length > 0) setClickedOpening(addedOpenings[0]);
        else {
          setClickedOnOpening(false);
          setClickedOpening(initialOpening);
        }
      } else if (page == 1 && addedOpenings.length > 0 && windowWidth > 640) {
        setClickedOnOpening(true);
        setClickedOpening(addedOpenings[0]);
      }

      setPage(prev => prev + 1);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      }
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, []);
  return (
    <>
      {clickedOnNewOpening && checkOrgAccess(ORG_MANAGER) ? (
        <NewOpening setShow={setClickedOnNewOpening} openings={openings} setOpenings={setOpenings} />
      ) : (
        <></>
      )}
      <div className="w-full flex justify-evenly gap-4 px-4 pb-base_padding">
        {openings.length > 0 ? (
          <>
            <InfiniteScroll
              className={`${clickedOnOpening ? 'w-full' : 'w-[720px]'} max-lg:w-full flex flex-col gap-4`}
              dataLength={openings.length}
              next={fetchOpenings}
              hasMore={hasMore}
              loader={<Loader />}
            >
              {openings.map(opening => {
                return (
                  <OpeningCard
                    key={opening.id}
                    opening={opening}
                    clickedOpening={clickedOpening}
                    setClickedOnOpening={setClickedOnOpening}
                    setClickedOpening={setClickedOpening}
                    org={true}
                  />
                );
              })}
            </InfiniteScroll>
            {clickedOnOpening && (
              <OpeningView
                opening={clickedOpening}
                setShow={setClickedOnOpening}
                setOpening={setClickedOpening}
                org={true}
              />
            )}
          </>
        ) : (
          <div className="w-5/6 mx-auto">
            <Mascot message="This organization is as quiet as a library at midnight. Shh, no openings yet." />
          </div>
        )}
      </div>
    </>
  );
}
