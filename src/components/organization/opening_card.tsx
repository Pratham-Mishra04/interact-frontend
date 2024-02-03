import { Opening } from '@/types';
import React, { useState } from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import { useSelector } from 'react-redux';
import { currentOrgSelector } from '@/slices/orgSlice';
import deleteHandler from '@/handlers/delete_handler';
import { SERVER_ERROR } from '@/config/errors';
import ConfirmDelete from '../common/confirm_delete';
import Link from 'next/link';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';
import { Pen, TrashSimple } from '@phosphor-icons/react';
import EditOpening from '@/sections/organization/openings/edit_opening';

interface Props {
  opening: Opening;
  setOpenings: React.Dispatch<React.SetStateAction<Opening[]>>;
}

const OpeningCard = ({ opening, setOpenings }: Props) => {
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const currentOrg = useSelector(currentOrgSelector);

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Opening...');

    const URL = `/org/${currentOrg.id}/org_openings/${opening.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setOpenings(prev => prev.filter(o => o.id != opening.id));
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Opening Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <>
      {clickedOnEdit ? <EditOpening setShow={setClickedOnEdit} opening={opening} setOpenings={setOpenings} /> : <></>}
      {clickedOnDelete ? <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} /> : <></>}

      <div className="w-full bg-gray-100 hover:bg-white dark:hover:bg-transparent dark:bg-transparent font-primary dark:text-white border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-8 max-md:p-4 flex items-center gap-12 max-md:gap-4 transition-ease-300">
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${opening.organization?.user.profile}`}
          className={'w-[140px] h-[140px] max-lg:w-[90px] max-lg:h-[90px] rounded-lg object-cover'}
        />

        <div className="grow flex flex-col gap-4 max-md:gap-2">
          <div className="flex items-start justify-between">
            <div className="w-5/6 flex flex-col gap-1">
              <div className="font-bold text-2xl max-md:text-lg text-gradient">{opening.title}</div>
              <div className="text-sm text-gray-500">{moment(opening.createdAt).fromNow()}</div>
              <div className="text-sm mt-2">
                {opening.noApplications} Application{opening.noApplications == 1 ? '' : 's'}
              </div>
              {checkOrgAccess(ORG_MANAGER) && (
                <>
                  {opening.noApplications > 0 ? (
                    <Link
                      href={`/workspace/manage/applications/${opening.id}`}
                      className="w-fit text-[#15bffd] text-sm max-md:text-sm underline underline-offset-4"
                    >
                      View
                    </Link>
                  ) : (
                    <div className="w-fit dark:text-white text-sm max-md:text-sm underline underline-offset-4 cursor-default">
                      No applications
                    </div>
                  )}
                </>
              )}
            </div>

            {checkOrgAccess(ORG_MANAGER) && (
              <div className="flex gap-3">
                <Pen onClick={() => setClickedOnEdit(true)} className="cursor-pointer" size={24} />
                <TrashSimple
                  onClick={() => setClickedOnDelete(true)}
                  className="cursor-pointer"
                  size={24}
                  color="#ea333e"
                  weight="fill"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OpeningCard;
