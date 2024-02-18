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
import getHandler from '@/handlers/get_handler';
import { ORG_URL, RESOURCE_URL } from '@/config/routes';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import NewResourceFile from '@/sections/organization/resources/new_resource_file';
import Loader from '@/components/common/loader';
import Mascot from '@/components/loaders/mascot';
import moment from 'moment';
import patchHandler from '@/handlers/patch_handler';
import deleteHandler from '@/handlers/delete_handler';
import { initialResourceBucket, initialResourceFile } from '@/types/initials';
import ConfirmDelete from '@/components/common/confirm_delete';
import Link from 'next/link';
import ResourceFileView from './resource_file_view';
import PDFViewer from '@/components/utils/pdf_viewer';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  resourceBucket: ResourceBucket;
  setResources?: React.Dispatch<React.SetStateAction<ResourceBucket[]>>;
  setClickedResourceBucket?: React.Dispatch<React.SetStateAction<ResourceBucket>>;
  setClickedOnResourceBucket?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResourceView = ({
  setShow,
  resourceBucket,
  setResources,
  setClickedResourceBucket,
  setClickedOnResourceBucket,
}: Props) => {
  const [title, setTitle] = useState(resourceBucket.title);
  const [description, setDescription] = useState(resourceBucket.description);
  const [viewAccess, setViewAccess] = useState(resourceBucket.viewAccess);
  const [editAccess, setEditAccess] = useState(resourceBucket.editAccess);

  const [resourceFiles, setResourceFiles] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [clickedOnUploadFile, setClickedOnUploadFile] = useState(false);
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [showDeleteTip, setShowDeleteTip] = useState<boolean>(false);
  const [showEditTip, setShowEditTip] = useState<boolean>(false);
  const [showAddNewTip, setShowAddNewTip] = useState<boolean>(false);

  const [clickedOnFile, setClickedOnFile] = useState(false);
  const [clickedFile, setClickedFile] = useState(initialResourceFile);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const getResourceBucketFiles = () => {
    const URL = `${ORG_URL}/${currentOrgID}/resource/${resourceBucket.id}`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const resourceFiles = res.data.resourceFiles || [];
          setResourceFiles(resourceFiles);
          setLoading(false);
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  const handleEdit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    const toaster = Toaster.startLoad('Editing Bucket Details');

    const URL = `${ORG_URL}/${currentOrgID}/resource/${resourceBucket.id}`;

    const formData = new FormData();

    if (title != resourceBucket.title) formData.append('title', title);
    if (description != resourceBucket.description) formData.append('description', description);
    if (viewAccess != resourceBucket.viewAccess) formData.append('viewAccess', viewAccess);
    if (editAccess != resourceBucket.editAccess) formData.append('editAccess', editAccess);

    const res = await patchHandler(URL, formData);
    if (res.statusCode === 200) {
      const bucket: ResourceBucket = res.data.resourceBucket;
      if (setResources)
        setResources(prev =>
          prev.map(r => {
            if (r.id == resourceBucket.id) return bucket;
            else return r;
          })
        );
      if (setClickedResourceBucket) setClickedResourceBucket(resourceBucket);
      setClickedOnEdit(false);
      Toaster.stopLoad(toaster, 'Resource Bucket Edited', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Bucket');

    const URL = `${ORG_URL}/${currentOrgID}/resource/${resourceBucket.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      if (setResources) setResources(prev => prev.filter(r => r.id != resourceBucket.id));
      if (setClickedOnResourceBucket) setClickedOnResourceBucket(false);
      if (setClickedResourceBucket) setClickedResourceBucket(initialResourceBucket);
      Toaster.stopLoad(toaster, 'Resource Bucket Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  useEffect(() => getResourceBucketFiles(), [resourceBucket]);
  return (
    <>
      <div className="w-[70%] aspect-[5/3] font-primary bg-white rounded-xl fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[100] shadow-lg p-4 animate-fade_third">
        {clickedOnUploadFile ? (
          <NewResourceFile
            setShow={setClickedOnUploadFile}
            resourceBucketID={resourceBucket.id}
            setResourceFiles={setResourceFiles}
            resourceFiles={resourceFiles}
            setResourceBuckets={setResources}
            setClickedResourceBucket={setClickedResourceBucket}
          />
        ) : (
          <></>
        )}
        {clickedOnDelete ? <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} /> : <></>}

        {clickedOnFile ? (
          <ResourceFileView
            resourceFile={clickedFile}
            setShow={setClickedOnFile}
            setResourceFiles={setResourceFiles}
            setClickedResourceFile={setClickedFile}
            setClickedOnResourceFile={setClickedOnFile}
            setResourceBuckets={setResources}
            setClickedResourceBucket={setClickedResourceBucket}
          />
        ) : (
          <></>
        )}

        {/* {clickedOnFile ? <PDFViewer resourceID={clickedFile.id} setShow={setClickedOnFile} /> : <></>} */}

        {loading ? (
          <Loader />
        ) : (
          <div className="w-full h-full flex gap-4">
            <div className="w-1/3 h-full flex flex-col items-center gap-4 border-r-[1px] border-dashed p-2 ">
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
                <div className="w-full flex justify-end items-center gap-1">
                  {checkOrgAccess(resourceBucket.editAccess) ? (
                    <div className="relative">
                      <Plus
                        size={40}
                        className="flex-center rounded-full hover:bg-slate-100 p-2 transition-ease-300 cursor-pointer"
                        weight="regular"
                        onClick={() => setClickedOnUploadFile(true)}
                        onMouseEnter={() => setShowAddNewTip(true)}
                        onMouseLeave={() => setShowAddNewTip(false)}
                      />
                      <div
                        className={`${
                          showAddNewTip ? 'block' : 'hidden'
                        } tip absolute top-10 bg-dark_sidebar text-white px-4 rounded-lg py-2 w-max left-1/2 -translate-x-1/2 z-[100]`}
                      >
                        Add new file
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {checkOrgAccess(ORG_SENIOR) ? (
                    <div className="relative">
                      <PencilSimple
                        size={40}
                        className="flex-center rounded-full hover:bg-slate-100 p-2 transition-ease-300 cursor-pointer"
                        weight="regular"
                        onClick={() => setClickedOnEdit(true)}
                        onMouseEnter={() => setShowEditTip(true)}
                        onMouseLeave={() => setShowEditTip(false)}
                      />
                      <div
                        className={`${
                          showEditTip ? 'block' : 'hidden'
                        } tip absolute top-10 bg-dark_sidebar text-white px-4 rounded-lg py-2 w-max left-1/2 -translate-x-1/2 z-[100]`}
                      >
                        Edit Details
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {checkOrgAccess(ORG_SENIOR) ? (
                    <div className="relative">
                      <TrashSimple
                        size={40}
                        className="flex-center rounded-full hover:bg-slate-100 p-2 transition-ease-300 cursor-pointer"
                        weight="regular"
                        onClick={() => setClickedOnDelete(true)}
                        onMouseEnter={() => setShowDeleteTip(true)}
                        onMouseLeave={() => setShowDeleteTip(false)}
                      />
                      <div
                        className={`${
                          showDeleteTip ? 'block' : 'hidden'
                        } tip absolute top-10 bg-dark_sidebar text-white px-4 rounded-lg py-2 w-max left-1/2 -translate-x-1/2 z-[100]`}
                      >
                        Delete Bucket
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              )}

              <div className="w-36 h-36 flex-center flex-col items-center gap-1 border-dark_primary_btn border-[8px] rounded-full">
                <div className="text-7xl font-bold text-gradient">{resourceBucket.noFiles}</div>
                <div className="w-40 text-center">File{resourceBucket.noFiles != 1 ? 's' : ''}</div>
              </div>

              {clickedOnEdit ? (
                <>
                  <div className="w-full h-fit flex flex-col gap-4">
                    <div className="w-full flex flex-col gap-4">
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
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full flex justify-between items-center">
                      <div>View Access -</div>
                      <select
                        onChange={el => setViewAccess(el.target.value)}
                        value={viewAccess}
                        className="w-1/2 max-lg:w-full h-12 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-nonetext-sm rounded-lg block p-2"
                      >
                        {[ORG_MEMBER, ORG_SENIOR, ORG_MANAGER].map((c, i) => {
                          return (
                            <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                              {c}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <div>Create Access -</div>
                      <select
                        onChange={el => setEditAccess(el.target.value)}
                        value={editAccess}
                        className="w-1/2 max-lg:w-full h-12 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-nonetext-sm rounded-lg block p-2"
                      >
                        {[ORG_MEMBER, ORG_SENIOR, ORG_MANAGER].map((c, i) => {
                          return (
                            <option className="bg-primary_comp_hover dark:bg-[#10013b30]" key={i} value={c}>
                              {c}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1 text-center">
                    <div className="text-3xl font-semibold">{resourceBucket.title}</div>
                    <div className="text-gray-500">{resourceBucket.description}</div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center gap-1">
                      {resourceBucket.viewAccess == ORG_MEMBER ? (
                        <UserCircle size={42} />
                      ) : resourceBucket.viewAccess == ORG_SENIOR ? (
                        <UserCirclePlus size={42} />
                      ) : resourceBucket.viewAccess == ORG_MANAGER ? (
                        <UserCircleGear size={42} />
                      ) : (
                        <></>
                      )}
                      <div className="flex-center flex-col text-xs">
                        <div className="font-semibold">{resourceBucket.viewAccess}s</div> can view files
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {resourceBucket.editAccess == ORG_MEMBER ? (
                        <UserCircle size={42} />
                      ) : resourceBucket.editAccess == ORG_SENIOR ? (
                        <UserCirclePlus size={42} />
                      ) : resourceBucket.editAccess == ORG_MANAGER ? (
                        <UserCircleGear size={42} />
                      ) : (
                        <></>
                      )}
                      <div className="flex-center flex-col text-xs">
                        <div className="font-semibold">{resourceBucket.editAccess}s</div> can add files
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="text-xs font-medium text-gray-400 mt-2">
                Created {moment(resourceBucket.createdAt).fromNow()}
              </div>
            </div>
            <div className="file-content w-2/3 h-full">
              {resourceFiles && resourceFiles.length > 0 ? (
                <table className="file-table w-full mt-4 rounded-xl overflow-hidden">
                  <thead className="bg-primary_text text-white h-10">
                    <th>Title</th>
                    <th>Type</th>
                    <th>Uploaded On</th>
                    <th>View</th>
                  </thead>
                  {resourceFiles.map((file: ResourceFile, i) => (
                    <tr
                      key={i}
                      onClick={() => {
                        setClickedFile(file);
                        setClickedOnFile(true);
                      }}
                      className="hover:bg-gray-100 transition-ease-200 cursor-pointer"
                    >
                      <td className="font-medium">{file.title}</td>
                      <td className="line-clamp-1 uppercase">{file.type != '' ? file.type : '-'}</td>
                      <td>{moment(file.createdAt).format('DD MMM, YY')}</td>
                      <td>
                        <Link
                          target="_blank"
                          href={file.isFileUploaded ? `/organisation/resources/${file.id}` : file.path}
                          className="flex-center h-full"
                        >
                          <ArrowUpRight />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </table>
              ) : (
                <Mascot message={'"Currently, this bucket is empty. Please check back later for updates.'} />
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className="overlay bg-backdrop w-full h-full fixed top-0 left-0 z-[80] animate-fade_third"
        onClick={() => setShow(false)}
      ></div>
    </>
  );
};

export default ResourceView;
