import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { EventHistory } from '@/types';
import Toaster from '@/utils/toaster';
import OrganisationHistoryWrapper from '@/wrappers/organisation_history';
import { X } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  eventID: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const History = ({ eventID, setShow }: Props) => {
  const [history, setHistory] = useState<EventHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const fetchHistory = async () => {
    const URL = `${ORG_URL}/${currentOrgID}/events/${eventID}/history`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setHistory(res.data.history || []);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getHistoryString = (history: EventHistory) => {
    const trueFields = Object.keys(history).filter(key => history[key as keyof EventHistory] === true);
    if (trueFields.length === 1) {
      return trueFields[0];
    } else if (trueFields.length === 2) {
      return `${trueFields[0]} and ${trueFields[1]}`;
    } else if (trueFields.length > 2) {
      const lastField = trueFields.pop();
      return `${trueFields.join(', ')} and ${lastField}`;
    } else {
      return '';
    }
  };

  return (
    <>
      <div className="w-1/3 max-lg:w-5/6 h-[640px] overflow-y-auto fixed bg-white text-gray-800 z-30 translate-x-1/2 -translate-y-1/4 top-64 max-lg:top-1/4 max-md:top-56 right-1/2 flex flex-col p-8 max-md:px-4 max-md:py-8 gap-6 border-[1px] border-gray-600 shadow-xl dark:border-dark_primary_btn rounded-xl animate-fade_third">
        <div className="w-full flex justify-between items-center">
          <div className="text-5xl text-primary_black font-semibold">History</div>
          <X onClick={() => setShow(false)} className="cursor-pointer" size={24} weight="bold" />
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="w-full flex flex-col gap-2">
            {history.map(history => (
              <OrganisationHistoryWrapper key={history.id} history={history}>
                Edited {getHistoryString(history)}
              </OrganisationHistoryWrapper>
            ))}
          </div>
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
