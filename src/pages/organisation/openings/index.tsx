import BaseWrapper from '@/wrappers/base';
import OrgSidebar from '@/components/common/org_sidebar';
import MainWrapper from '@/wrappers/main';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useState, useEffect } from 'react';
import NewOpening from '@/sections/organization/openings/new_opening';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { Info, Plus } from '@phosphor-icons/react';
import { ORG_MANAGER } from '@/config/constants';
import NoOpenings from '@/components/empty_fillers/no_openings';
import OpeningCard from '@/components/organization/opening_card';
import { Opening } from '@/types';
import Toaster from '@/utils/toaster';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import InfiniteScroll from 'react-infinite-scroll-component';
import AccessTree from '@/components/organization/access_tree';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import WidthCheck from '@/utils/wrappers/widthCheck';

const Openings = () => {
  const [loading, setLoading] = useState(true);
  const [clickedOnNewOpening, setClickedOnNewOpening] = useState(false);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const getOpenings = async () => {
    const URL = `/org/${currentOrg.id}/org_openings?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const addedOpenings = [...openings, ...(res.data.openings || [])];
      if (addedOpenings.length === openings.length) setHasMore(false);
      setOpenings(addedOpenings);
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
    getOpenings();
  }, []);

  return (
    <BaseWrapper title={`Openings | ${currentOrg.title}`}>
      <OrgSidebar index={15}></OrgSidebar>
      <MainWrapper>
        {clickedOnNewOpening && (
          <NewOpening setShow={setClickedOnNewOpening} openings={openings} setOpenings={setOpenings} />
        )}
        {clickedOnInfo && <AccessTree type="opening" setShow={setClickedOnInfo} />}
        <div className="w-full flex justify-between items-center p-base_padding">
          <div className="w-fit text-6xl font-semibold dark:text-white font-primary ">Openings</div>
          <div className="flex items-center gap-2">
            {checkOrgAccess(ORG_MANAGER) && (
              <Plus
                onClick={() => setClickedOnNewOpening(prev => !prev)}
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

        {loading ? (
          <Loader />
        ) : openings.length > 0 ? (
          <InfiniteScroll
            dataLength={openings.length}
            next={getOpenings}
            hasMore={hasMore}
            loader={<Loader />}
            className="w-full flex flex-wrap gap-4 justify-between px-base_padding"
          >
            {openings.map(opening => {
              return <OpeningCard key={opening.id} opening={opening} setOpenings={setOpenings} />;
            })}
          </InfiniteScroll>
        ) : (
          <NoOpenings />
        )}
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Openings));
