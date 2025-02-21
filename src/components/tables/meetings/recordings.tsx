import Loader from '@/components/common/loader';
import ToolTip from '@/components/utils/tooltip';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { currentOrgSelector } from '@/slices/orgSlice';
import { Recording } from '@/types';
import { getParticipationDuration } from '@/utils/funcs/session_details';
import Toaster from '@/utils/toaster';
import ModalWrapper from '@/wrappers/modal';
import { ArrowDown } from '@phosphor-icons/react';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  meetingID: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const RecordingsTable = ({ meetingID, setShow }: Props) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const currentOrg = useSelector(currentOrgSelector);

  const limit = 20;

  const getRecordings = async () => {
    setLoading(true);
    const URL = `/org/${currentOrg.id}/meetings/recordings/${meetingID}?page=${page}&limit=${limit}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const addedRecordings = [...(res.data.recordings || []), ...recordings];
      if (addedRecordings.length === recordings.length) setHasMore(false);
      setRecordings(addedRecordings);
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
    getRecordings();
  }, []);

  return (
    <ModalWrapper setShow={setShow} width={'2/3'} blur={true} top={recordings.length < 5 ? '1/3' : '1/2'}>
      <div className="text-3xl font-semibold mb-4">Meeting Recordings</div>
      {loading && page == 1 ? (
        <Loader />
      ) : recordings.length > 0 ? (
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-12 bg-slate-200 rounded-xl border-gray-400 flex font-semibold text-primary_black">
            <div className="w-1/3 flex-center">Session ID</div>
            <div className="w-[15%] flex-center">Start Time</div>
            <div className="w-[15%] flex-center">Stop Time</div>
            <div className="w-[15%] flex-center">Duration</div>
            <div className="w-[15%] flex-center gap-1">
              Size <span className="text-xs font-normal">(in MB)</span>
            </div>
            <div className="grow flex-center"></div>
          </div>
          {recordings.map(recording => (
            <div
              key={recording.id}
              className="w-full h-12 bg-slate-100 rounded-xl border-gray-400 flex text-sm text-primary_black"
            >
              <div className="w-1/3 flex-center text-xs line-clamp-1">{recording.session_id}</div>
              <div className="w-[15%] flex-center">{moment(recording.started_time).format('hh:mm:ss A')}</div>
              <div className="w-[15%] flex-center">{moment(recording.stopped_time).format('hh:mm:ss A')}</div>
              <div className="w-[15%] flex-center">
                {getParticipationDuration(recording.started_time, recording.stopped_time)}
              </div>
              <div className="w-[15%] flex-center capitalize">{(Number(recording.file_size) / 1000000).toFixed(2)}</div>
              <div className="grow flex-center relative group">
                <ToolTip
                  styles={{
                    fontSize: '10px',
                    padding: '2px',
                    width: '80px',
                    top: '-30px',
                    left: '50%',
                    translate: '-50% 0',
                  }}
                  content={
                    recording.download_url != ''
                      ? moment(moment()).isBefore(recording?.download_url_expiry)
                        ? 'Download'
                        : 'Expired'
                      : 'Not Available'
                  }
                />
                {recording.download_url != '' && moment(moment()).isBefore(recording?.download_url_expiry) ? (
                  <Link href={recording.download_url || '#'}>
                    <ArrowDown size={20} weight="bold" />
                  </Link>
                ) : (
                  <div className="cursor-default opacity-50">
                    <ArrowDown size={20} weight="regular" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading ? (
            <Loader />
          ) : (
            recordings.length % limit == 0 &&
            hasMore && (
              <div
                onClick={getRecordings}
                className="w-fit mx-auto pt-4 text-xs text-gray-700 dark:text-white font-medium hover-underline-animation after:bg-gray-700 cursor-pointer"
              >
                Load More
              </div>
            )
          )}
        </div>
      ) : (
        <div className="text-lg">No recordings found for this meeting.</div>
      )}
    </ModalWrapper>
  );
};

export default RecordingsTable;
