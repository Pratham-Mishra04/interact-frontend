import Loader from '@/components/common/loader';
import OrgSidebar from '@/components/common/org_sidebar';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import { OrganizationHistory } from '@/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SERVER_ERROR } from '@/config/errors';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import Created from '@/components/history/organisation/created';
import Deleted from '@/components/history/organisation/deleted';
import Edited from '@/components/history/organisation/edited';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import WidthCheck from '@/utils/wrappers/widthCheck';

const History = () => {
  const [history, setHistory] = useState<OrganizationHistory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const currentOrg = useSelector(currentOrgSelector);

  const fetchHistory = async () => {
    const URL = `${ORG_URL}/${currentOrg.id}/history?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const addedHistory: OrganizationHistory[] = [...history, ...(res.data.history || [])];
      if (addedHistory.length === history.length) setHasMore(false);
      setHistory(addedHistory);
      setPage(prev => prev + 1);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);
  return (
    <BaseWrapper title={`History | ${currentOrg.title}`}>
      <OrgSidebar index={7} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-6 max-md:px-2 p-base_padding">
          <div className="w-full text-6xl font-semibold dark:text-white font-primary">History</div>
          <div className="w-full">
            {loading ? (
              <Loader />
            ) : (
              <InfiniteScroll
                dataLength={history.length}
                next={fetchHistory}
                hasMore={hasMore}
                loader={<Loader />}
                className="w-full flex flex-col gap-2"
              >
                {history.map((history, index) => {
                  switch (history.historyType) {
                    case -1:
                    case 0:
                    case 3:
                    case 6:
                    case 9:
                    case 12:
                    case 18:
                    case 21:
                    case 24:
                    case 27:
                      return <Created key={index} history={history} />;
                    case 1:
                    case 4:
                    case 5:
                    case 7:
                    case 10:
                    case 13:
                    case 15:
                    case 19:
                    case 22:
                    case 25:
                    case 28:
                    case 29:
                      return <Deleted history={history} />;
                    case 2:
                    case 8:
                    case 11:
                    case 14:
                    case 16:
                    case 17:
                    case 20:
                    case 23:
                    case 26:
                      return <Edited key={index} history={history} />;
                    default:
                      return <></>;
                  }
                })}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(History));
