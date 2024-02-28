import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Opening, Project } from '@/types';
import { OPENING_URL, PROJECT_PIC_URL } from '@/config/routes';
import { Pen, TrashSimple } from '@phosphor-icons/react';
import EditOpening from '@/sections/workspace/manage_project/edit_opening';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import ConfirmDelete from '@/components/common/confirm_delete';
import { SERVER_ERROR } from '@/config/errors';
import deleteHandler from '@/handlers/delete_handler';
import Toaster from '@/utils/toaster';
import moment from 'moment';

interface Props {
  opening: Opening;
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
}

const OpeningCard = ({ opening, project, setProject }: Props) => {
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);
  const user = useSelector(userSelector);

  useEffect(() => {
    const oid = new URLSearchParams(window.location.search).get('oid');
    const action = new URLSearchParams(window.location.search).get('action');

    if (oid && action == 'edit')
      if (opening.id == oid) {
        setClickedOnEdit(true);
      }
  }, []);

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Opening...');

    const URL = `${OPENING_URL}/${opening.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setProject)
        setProject(prev => {
          return {
            ...prev,
            openings: prev.openings.filter(o => o.id != opening.id),
          };
        });
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Opening Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <>
      {clickedOnEdit && (
        <EditOpening setShow={setClickedOnEdit} opening={opening} project={project} setProject={setProject} />
      )}
      {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />}
      <div className="w-full bg-gray-100 hover:bg-white dark:hover:bg-transparent dark:bg-transparent font-primary dark:text-white border-[1px] border-primary_btn dark:border-dark_primary_btn rounded-lg p-8 max-md:p-4 flex items-center gap-12 max-md:gap-4 transition-ease-300">
        <Image
          crossOrigin="anonymous"
          width={50}
          height={50}
          alt={'User Pic'}
          src={`${PROJECT_PIC_URL}/${project.coverPic}`}
          className={'w-[120px] h-[120px] max-md:w-[90px] max-md:h-[90px] rounded-lg object-cover'}
          placeholder="blur"
          blurDataURL={project.blurHash}
        />

        <div className="grow flex flex-col gap-4 max-md:gap-2">
          <div className="flex items-start justify-between">
            <div className="w-5/6 flex flex-col gap-1">
              <div className="font-bold text-2xl max-md:text-lg text-gradient">{opening.title}</div>
              {/* <div className="text-lg max-md:text-sm">{project.title}</div> */}
              <div className="text-sm text-gray-500">{moment(opening.createdAt).fromNow()}</div>
              <div className="text-sm mt-2">
                {opening.noApplications} Application{opening.noApplications == 1 ? '' : 's'}
              </div>
              {project.userID == user.id || user.managerProjects.includes(project.id) ? (
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
              ) : (
                <></>
              )}
            </div>
            <div className="flex gap-3">
              {(project.userID == user.id || user.editorProjects.includes(project.id)) && (
                <Pen onClick={() => setClickedOnEdit(true)} className="cursor-pointer" size={24} />
              )}
              {(project.userID == user.id || user.managerProjects.includes(project.id)) && (
                <TrashSimple
                  onClick={() => setClickedOnDelete(true)}
                  className="cursor-pointer"
                  size={24}
                  color="#ea333e"
                  weight="fill"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OpeningCard;
