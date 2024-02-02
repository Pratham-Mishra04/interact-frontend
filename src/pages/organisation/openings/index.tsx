import BaseWrapper from '@/wrappers/base';
import OrgSidebar from '@/components/common/org_sidebar';
import MainWrapper from '@/wrappers/main';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useState, useEffect } from 'react';
import NewOpening from '@/sections/organization/openings/new_opening';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { Plus } from '@phosphor-icons/react';
import { ORG_MANAGER } from '@/config/constants';
import NoOpenings from '@/components/empty_fillers/no_openings';
import OpeningCard from '@/components/organization/opening_card';
import ViewOpening from '@/sections/organization/openings/opening_view';
import { Opening } from '@/types';
import Toaster from '@/utils/toaster';
import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { initialOpening } from '@/types/initials';

const Openings = () => {
  const [loading, setLoading] = useState(true);
  const [clickedOnNewOpening, setClickedOnNewOpening] = useState(false);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [clickedOnOpening, setClickedOnOpening] = useState(false);
  const [clickedOpening, setClickedOpening] = useState(initialOpening);
  const currentOrg = useSelector(currentOrgSelector);

  const getOpenings = async () => {
    setLoading(true);
    const URL = `/org/${currentOrg.id}/orgopenings`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      setOpenings(res.data.openings || []);
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
    <BaseWrapper title="Openings">
      {clickedOnOpening ? (
        <ViewOpening
          setClickedOnOpening={setClickedOnOpening}
          opening={clickedOpening}
          setClickedOpening={setClickedOpening}
          openings={openings}
          setOpenings={setOpenings}
        />
      ) : (
        ''
      )}
      <OrgSidebar index={15}></OrgSidebar>
      <MainWrapper>
        {clickedOnNewOpening ? (
          <NewOpening setShow={setClickedOnNewOpening} openings={openings} setOpenings={setOpenings} />
        ) : (
          ''
        )}
        <div className="w-full flex justify-between items-center p-base_padding f ">
          <div className="w-fit text-6xl font-semibold dark:text-white font-primary ">Openings</div>
          {checkOrgAccess(ORG_MANAGER) ? (
            <Plus
              onClick={() => setClickedOnNewOpening(prev => !prev)}
              size={42}
              className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
              weight="regular"
            />
          ) : (
            ''
          )}
        </div>

        {loading ? (
          <Loader />
        ) : openings.length > 0 ? (
          openings.map((opening, index) => {
            return (
              <OpeningCard
                setClickedOnOpening={setClickedOnOpening}
                key={index}
                opening={opening}
                setClickedOpening={setClickedOpening}
              />
            );
          })
        ) : (
          <NoOpenings />
        )}
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Openings;
