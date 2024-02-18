import React, { useEffect, useState } from 'react';
import { ResourceBucket, ResourceFile } from '@/types';
import {
  ArrowUpRight,
  Check,
  PencilSimple,
  Plus,
  TrashSimple,
  UserCircle,
  UserCircleGear,
  UserCirclePlus,
  X,
} from '@phosphor-icons/react';
import { ORG_MANAGER, ORG_MEMBER, ORG_SENIOR } from '@/config/constants';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_URL, RESOURCE_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import NewResourceFile from '@/sections/organization/resources/new_resource_file';
import Loader from '@/components/common/loader';
import moment from 'moment';
import patchHandler from '@/handlers/patch_handler';
import deleteHandler from '@/handlers/delete_handler';
import { initialResourceBucket, initialResourceFile } from '@/types/initials';
import ConfirmDelete from '@/components/common/confirm_delete';
import Link from 'next/link';
import Image from 'next/image';
import { userIDSelector } from '@/slices/userSlice';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  resourceFile: ResourceFile;
  setResourceFiles?: React.Dispatch<React.SetStateAction<ResourceFile[]>>;
  setClickedResourceFile?: React.Dispatch<React.SetStateAction<ResourceFile>>;
  setClickedOnResourceFile?: React.Dispatch<React.SetStateAction<boolean>>;
  setResourceBuckets?: React.Dispatch<React.SetStateAction<ResourceBucket[]>>;
  setClickedResourceBucket?: React.Dispatch<React.SetStateAction<ResourceBucket>>;
}

const ResourceFileView = ({
  setShow,
  resourceFile,
  setResourceFiles,
  setClickedResourceFile,
  setClickedOnResourceFile,
  setResourceBuckets,
  setClickedResourceBucket,
}: Props) => {
  const [title, setTitle] = useState(resourceFile.title);
  const [description, setDescription] = useState(resourceFile.description);

  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const currentOrgID = useSelector(currentOrgIDSelector);
  const userID = useSelector(userIDSelector);

  const handleEdit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    const toaster = Toaster.startLoad('Editing File Details');

    const URL = `${ORG_URL}/${currentOrgID}/resource/${resourceFile.resourceBucketID}/file/${resourceFile.id}`;

    const formData = new FormData();

    if (title != resourceFile.title) formData.append('title', title);
    if (description != resourceFile.description) formData.append('description', description);

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      const file: ResourceFile = res.data.resourceFile;
      file.user = resourceFile.user;
      if (setResourceFiles)
        setResourceFiles(prev =>
          prev.map(r => {
            if (r.id == resourceFile.id) return file;
            else return r;
          })
        );
      if (setClickedResourceFile) setClickedResourceFile(file);
      setClickedOnEdit(false);
      Toaster.stopLoad(toaster, 'Resource File Edited', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting File');

    const URL = `${ORG_URL}/${currentOrgID}/resource/${resourceFile.resourceBucketID}/file/${resourceFile.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      if (setResourceFiles) setResourceFiles(prev => prev.filter(f => f.id != resourceFile.id));
      if (setClickedOnResourceFile) setClickedOnResourceFile(false);
      if (setClickedResourceFile) setClickedResourceFile(initialResourceFile);
      if (setResourceBuckets)
        setResourceBuckets(prev =>
          prev.map(r => {
            if (r.id == resourceFile.resourceBucketID) return { ...r, noFiles: r.noFiles - 1 };
            else return r;
          })
        );
      if (setClickedResourceBucket)
        setClickedResourceBucket(prev => {
          return { ...prev, noFiles: prev.noFiles - 1 };
        });
      Toaster.stopLoad(toaster, 'Resource File Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  return (
    <>
      {clickedOnDelete ? (
        <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />
      ) : (
        <>
          <div className="w-[40%] aspect-[500/333] font-primary bg-white rounded-xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[100] shadow-lg p-4 animate-fade_third">
            <Link
              target="_blank"
              href={resourceFile.isFileUploaded ? `/organisation/resources/${resourceFile.id}` : resourceFile.path}
              className="flex-center absolute top-3 right-3"
            >
              <ArrowUpRight size={30} />
            </Link>
            {resourceFile.userID == userID && !clickedOnEdit ? (
              <PencilSimple
                size={36}
                className="flex-center rounded-full hover:bg-slate-100 p-2 absolute top-3 left-3 transition-ease-300 cursor-pointer"
                weight="regular"
                onClick={() => setClickedOnEdit(true)}
              />
            ) : (
              <></>
            )}
            {resourceFile.userID == userID && !clickedOnEdit ? (
              <TrashSimple
                size={36}
                className="flex-center rounded-full hover:bg-slate-100 p-2 absolute top-3 left-12 transition-ease-300 cursor-pointer"
                weight="regular"
                onClick={() => setClickedOnDelete(true)}
              />
            ) : (
              <></>
            )}

            {clickedOnEdit ? (
              <div className="w-full h-full flex-center flex-col gap-2">
                <input
                  type="text"
                  className="w-full bg-transparent px-4 py-2 focus:outline-none text-xl font-medium"
                  placeholder="Resource Bucket Title (50 characters)"
                  maxLength={50}
                  value={title}
                  onChange={el => setTitle(el.target.value)}
                />

                <textarea
                  className="w-full min-h-[64px] max-h-56 px-4 py-2 bg-primary_comp dark:bg-dark_primary_comp rounded-lg focus:outline-none"
                  placeholder="Resource Description (500 characters)"
                  maxLength={500}
                  value={description}
                  onChange={el => setDescription(el.target.value)}
                ></textarea>
              </div>
            ) : (
              <div className="w-full h-full flex-center flex-col gap-2">
                <div className="text-3xl font-semibold text-center">{resourceFile.title}</div>
                <div className="text-gray-500 text-center">{resourceFile.description}</div>
                {resourceFile.type != '' && (
                  <div className="text-sm">
                    Type- <span className="uppercase font-medium">{resourceFile.type}</span>
                  </div>
                )}
              </div>
            )}

            {clickedOnEdit ? (
              <div className="w-full flex justify-end items-center gap-1">
                <X
                  size={42}
                  className="flex-center rounded-full hover:bg-slate-100 p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                  onClick={() => setClickedOnEdit(false)}
                />

                <Check
                  size={42}
                  className="flex-center rounded-full hover:bg-slate-100 p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                  onClick={handleEdit}
                />
              </div>
            ) : (
              <div className="flex-center gap-1 text-gray-500 text-sm">
                Uploaded by
                <Link
                  href={`/${
                    resourceFile.user.isOrganization
                      ? 'organisation/profile'
                      : `explore/user/${resourceFile.user.username}`
                  }`}
                  target="_blank"
                  className="flex-center gap-1"
                >
                  <Image
                    width={100}
                    height={100}
                    alt="User Pic"
                    src={`${USER_PROFILE_PIC_URL}/${resourceFile.user.profilePic}`}
                    className="w-4 h-4 rounded-full"
                  />
                  <div className="font-semibold hover-underline-animation after:bg-gray-500">
                    {' '}
                    {resourceFile.user.name}
                  </div>
                </Link>
                <span>
                  on <span className="font-semibold">{moment(resourceFile.createdAt).format('DD MMMM, YYYY')}</span>
                </span>
              </div>
            )}
          </div>
          <div
            className="overlay bg-backdrop w-full h-full fixed top-0 left-0 z-[80] rounded-xl animate-fade_third"
            onClick={() => setShow(false)}
          ></div>
        </>
      )}
    </>
  );
};

export default ResourceFileView;
