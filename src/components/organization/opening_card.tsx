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
import { Pen, TrashSimple } from '@phosphor-icons/react';
import EditOpening from '@/sections/organization/openings/edit_opening';

interface Props {
  opening: Opening;
  setOpenings: React.Dispatch<React.SetStateAction<Opening[]>>;
  isManager: boolean;
}

const OpeningCard = ({ opening, setOpenings, isManager }: Props) => {
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
      <div className="w-full bg-gray-100 hover:bg-white dark:hover:bg-transparent dark:bg-transparent font-primary dark:text-white border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-4 flex items-center gap-4 max-md:gap-4 transition-ease-300">
        <Image
          crossOrigin="anonymous"
          width={50}
          height={50}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${opening.organization?.user.profilePic}`}
          placeholder="blur"
          blurDataURL={opening.organization?.user.profilePicBlurHash || 'no-hash'}
          className={'w-[120px] h-[120px] max-md:w-[90px] max-md:h-[90px] rounded-full object-cover'}
        />

        <div className="w-full h-full flex items-start justify-between">
          <div className="w-5/6 flex flex-col gap-1">
            <div className="font-bold text-3xl max-md:text-lg text-gradient line-clamp-1">{opening.title}</div>
            {/* <div className="text-lg max-md:text-sm">{project.title}</div> */}
            <div className="text-xs text-gray-500 mb-8">{moment(opening.createdAt).fromNow()}</div>

            <div className="w-fit flex-center gap-2 mb-1">
              {opening.noApplications > 0 && (
                <div className="text-sm">
                  {opening.noApplications} Application{opening.noApplications == 1 ? '' : 's'}
                </div>
              )}

              {isManager &&
                (opening.noApplications > 0 ? (
                  <Link
                    href={`/organisation/openings/applications/${opening.id}`}
                    className="w-fit text-[#15bffd] text-sm max-md:text-sm underline underline-offset-4"
                  >
                    View
                  </Link>
                ) : (
                  <div className="w-fit dark:text-white text-sm max-md:text-sm underline underline-offset-4 cursor-default">
                    No applications
                  </div>
                ))}
            </div>
          </div>
          {isManager && (
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
    </>
  );
};

export default OpeningCard;
