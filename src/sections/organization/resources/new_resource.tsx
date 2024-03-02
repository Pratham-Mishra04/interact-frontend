import { ORG_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import { Organization, ResourceBucket } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import { ORG_MANAGER, ORG_MEMBER, ORG_SENIOR } from '@/config/constants';
import PrimaryButton from '@/components/buttons/primary_btn';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization: Organization;
  setShowResources?: React.Dispatch<React.SetStateAction<boolean>>;
  setResources?: React.Dispatch<React.SetStateAction<ResourceBucket[]>>;
}

const NewResource = ({ setShow, organization, setShowResources, setResources }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [viewAccess, setViewAccess] = useState(ORG_MEMBER);
  const [editAccess, setEditAccess] = useState(ORG_SENIOR);

  const [mutex, setMutex] = useState(false);
  const [tab, setTab] = useState(0);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const handleSubmit = async () => {
    if (title.trim().length == 0) {
      Toaster.error('Title cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding a new resource bucket');

    const URL = `${ORG_URL}/${currentOrgID}/resource`;
    const formData = {
      title,
      description,
      viewAccess,
      editAccess,
    };

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      const resource_bucket = res.data.resourceBucket;
      if (setResources) setResources(prev => [resource_bucket, ...prev]);
      setShow(false);
      if (setShowResources) setShowResources(true);
      Toaster.stopLoad(toaster, 'New Resource Bucket Added!', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
      setMutex(false);
    }
  };

  return (
    <>
      <div className="fixed top-1/2 -translate-y-1/2 w-[640px] max-md:w-5/6 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-4 rounded-lg p-10 max-md:p-5 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 animate-fade_third z-50">
        {tab === 0 ? (
          <>
            <div className="text-3xl max-md:text-xl font-semibold">Resource Bucket Info</div>
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
          </>
        ) : (
          <>
            <div className="text-3xl max-md:text-xl font-semibold">Manage Access</div>
            <div className="w-full flex flex-col gap-2">
              <div className="w-full flex justify-between items-start">
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
              <div className="w-full flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  Create Access -<div className="text-xs ">(adding/removing files)</div>
                </div>
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
        )}
        <div className="w-full flex justify-between items-center mt-4">
          {tab == 0 ? <div></div> : <PrimaryButton onClick={() => setTab(0)} label="Back" />}
          <PrimaryButton
            onClick={() => {
              if (tab === 0) setTab(1);
              else if (tab === 1) handleSubmit();
            }}
            label={tab === 0 ? 'Next' : 'Create'}
            disabled={title.trim() == ''}
          />
        </div>
      </div>

      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default NewResource;
