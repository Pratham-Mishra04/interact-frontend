import Loader from '@/components/common/loader';
import Created from '@/components/history/project/created';
import Deleted from '@/components/history/project/deleted';
import Edited from '@/components/history/project/edited';
import Membership from '@/components/history/project/membership';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { ProjectHistory } from '@/types';
import Toaster from '@/utils/toaster';
import { X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';

interface Props {
  projectID: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  org?: boolean;
}

const History = ({ projectID, setShow, org = false }: Props) => {
  const [history, setHistory] = useState<ProjectHistory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const fetchHistory = async () => {
    const URL = org
      ? `${ORG_URL}/${currentOrgID}/projects/history/${projectID}?page=${page}&limit=${10}`
      : `${PROJECT_URL}/history/${projectID}?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const addedHistory: ProjectHistory[] = [...history, ...(res.data.history || [])];
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
    <>
      <div className="w-1/3 max-lg:w-5/6 h-[640px] overflow-y-auto fixed bg-white text-gray-800 z-30 translate-x-1/2 -translate-y-1/4 top-64 max-lg:top-1/4 max-md:top-56 right-1/2 flex flex-col p-8 max-md:px-4 max-md:py-8 gap-6 border-[1px] border-gray-600 shadow-xl dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div className="w-full flex justify-between items-center">
          <div className="text-5xl text-primary_black font-semibold">History</div>
          <X onClick={() => setShow(false)} className="cursor-pointer" size={24} weight="bold" />
        </div>
        {loading && page == 1 ? (
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
            })}
          </InfiniteScroll>
        )}
      </div>
      <div
        onClick={() => setShow(false)}
        className=" bg-backdrop w-screen h-screen backdrop-blur-sm fixed top-0 right-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default History;
