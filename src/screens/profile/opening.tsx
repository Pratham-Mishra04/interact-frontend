import { useEffect, useState } from 'react';
import ViewOpening from '@/sections/organization/openings/opening_view';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { Opening } from '@/types';
import OpeningCard from '@/components/organization/opening_card';
import NewOpening from '@/sections/organization/openings/new_opening';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { initialOpening } from '@/types/initials';

interface Props {
  orgID: string;
}

export default function Openings(props: Props) {
  const [clickedOnNewOpening, setClickedOnNewOpening] = useState(false);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [clickedOnOpening, setClickedOnOpening] = useState(false);
  const [clickedOpening, setClickedOpening] = useState(initialOpening);

  useEffect(() => {
    const getOpenings = async () => {
      const URL = `/org/${props.orgID}/orgopenings`;
      const res = await getHandler(URL);
      if (res.statusCode === 200) {
        setOpenings(res.data.openings || []);
        return;
      } else {
        if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
        else {
          Toaster.error(SERVER_ERROR, 'error_toaster');
        }
      }
    };
    getOpenings();
  }, []);
  return (
    <>
      {clickedOnNewOpening && checkOrgAccess(ORG_MANAGER) ? (
        <NewOpening setShow={setClickedOnNewOpening} openings={openings} setOpenings={setOpenings} />
      ) : (
        ''
      )}
      <div className="w-full flex-row flex-wrap relative">
        {clickedOnOpening ? (
          <ViewOpening
            setClickedOnOpening={setClickedOnOpening}
            opening={clickedOpening}
            openings={openings}
            setOpenings={setOpenings}
            setClickedOpening={setClickedOpening}
          />
        ) : (
          ''
        )}
        {openings.map((opening: Opening, index: number) => {
          return (
            <OpeningCard
              setClickedOnOpening={setClickedOnOpening}
              key={index}
              opening={opening}
              setClickedOpening={setClickedOpening}
            />
          );
        })}
      </div>
    </>
  );
}
