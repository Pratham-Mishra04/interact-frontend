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
      {clickedOnEdit && <EditOpening setShow={setClickedOnEdit} opening={opening} setOpenings={setOpenings} />}
      {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />}

      <div className="w-[49%] relative bg-white font-primary border-[1px] border-primary_btn rounded-lg p-8 max-md:p-4 flex items-center gap-8 max-md:gap-4 transition-ease-300">
        {checkOrgAccess(ORG_MANAGER) && (
          <div className="absolute flex gap-3 top-4 right-4">
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
        <Image
          crossOrigin="anonymous"
          width={100}
          height={100}
          alt={'Org Pic'}
          src={`${USER_PROFILE_PIC_URL}/${opening.organization?.user.profilePic}`}
          className={'w-[140px] h-[140px] max-lg:w-[90px] max-lg:h-[90px] rounded-lg object-cover'}
        />

        <div className="w-[calc(100%-140px)] flex-col gap-2">
          <div className="font-bold text-2xl max-md:text-lg text-gradient line-clamp-1">{opening.title}</div>
          <div className="text-sm text-gray-500">{moment(opening.createdAt).fromNow()}</div>
          <div className="text-sm mt-2">
            {opening.noApplications} Application{opening.noApplications == 1 ? '' : 's'}
          </div>
          {checkOrgAccess(ORG_MANAGER) && opening.noApplications > 0 && (
            <Link
              href={`/organisation/openings/applications/${opening.id}`}
              className="w-fit text-[#15bffd] text-sm max-md:text-sm underline underline-offset-4"
            >
              View
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default OpeningCard;
