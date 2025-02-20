import React, { useEffect, useState } from 'react';
import { HackathonHistory } from '@/types';
import Created from '@/components/history/hackathon/created';
import Edited from '@/components/history/hackathon/edited';
import Deleted from '@/components/history/hackathon/deleted';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props {
  hackathonID: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const HackathonHistories: React.FC<Props> = ({ hackathonID, show, setShow }) => {
  const [history, setHistory] = useState<HackathonHistory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const currentOrg = useSelector(currentOrgSelector);

  const limit = 10;

  const fetchHistory = async () => {
    if (!currentOrg || !hackathonID) return;

    setLoading(true);

    const URL = `/org/${currentOrg.id}/hackathons/${hackathonID}/history?page=${page}&limit=${limit}`;

    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const addedHistory: HackathonHistory[] = [...history, ...(res.data.history || [])];
      if (addedHistory.length === history.length) setHasMore(false);
      setHistory(addedHistory);
      setPage(prev => prev + 1);

      setLoading(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentOrg, hackathonID]);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Hackathon Activity</DialogTitle>
        </DialogHeader>
        {loading && page == 1 ? (
          <Loader />
        ) : (
          <div className="w-full flex flex-col gap-2">
            {history.map(history => {
              switch (history.historyType) {
                case 0:
                case 3:
                case 6:
                case 9:
                case 12:
                case 15:
                case 18:
                case 20:
                  return <Created key={history.id} history={history} />;
                case 1:
                case 4:
                case 7:
                case 10:
                case 13:
                case 16:
                case 22:
                case 23:
                case 24:
                case 25:
                  return <Edited key={history.id} history={history} />;
                case 2:
                case 5:
                case 8:
                case 11:
                case 14:
                case 17:
                case 19:
                case 21:
                  return <Deleted key={history.id} history={history} />;
                default:
                  return null;
              }
            })}
            {loading ? (
              <Loader />
            ) : (
              history.length % limit == 0 &&
              hasMore && (
                <div
                  onClick={fetchHistory}
                  className="w-fit mx-auto pt-4 text-xs text-gray-700 dark:text-white font-medium hover-underline-animation after:bg-gray-700 cursor-pointer"
                >
                  Load More
                </div>
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HackathonHistories;
