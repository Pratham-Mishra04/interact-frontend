import Loader from '@/components/common/loader';
import Created from '@/components/history/project/created';
import Deleted from '@/components/history/project/deleted';
import Edited from '@/components/history/project/edited';
import Membership from '@/components/history/project/membership';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL, PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Project, ProjectHistory } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props {
  project: Project;
  org?: boolean;
}

const History = ({ project, org = false }: Props) => {
  const [history, setHistory] = useState<ProjectHistory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  const fetchHistory = async () => {
    const URL = org
      ? `${ORG_URL}/${project.organizationID}/projects/history/${project.id}?page=${page}&limit=${10}`
      : `${PROJECT_URL}/history/${project.id}?page=${page}&limit=${10}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const addedHistory: ProjectHistory[] = [...history, ...(res.data.history || [])];
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
  }, []);

  return (
    <Dialog>
      <DialogTrigger>
        <div className="text-xs hover:underline underline-offset-2 cursor-pointer">view all</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Project Activity</DialogTitle>
        </DialogHeader>
        {loading && page == 1 ? (
          <Loader />
        ) : (
          <div className="w-full flex flex-col gap-2">
            {history.map(history => {
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

export default History;
