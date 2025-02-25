import ResourceCard from '@/components/organization/resource_card';
import { SERVER_ERROR } from '@/config/errors';
import { PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import NewResource from '@/sections/resources/new_resource';
import ResourceView from '@/sections/resources/resource_view';
import { userSelector } from '@/slices/userSlice';
import { PermissionConfig, Project, ResourceBucket } from '@/types';
import { initialResourceBucket } from '@/types/initials';
import { checkProjectAccess, checkStaticProjectAccess } from '@/utils/funcs/access';
import Toaster from '@/utils/toaster';
import { SidePrimeWrapper } from '@/wrappers/side';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
interface Props {
  projectID: string;
  permissionConfig?: PermissionConfig;
}

const Resources = ({ projectID, permissionConfig }: Props) => {
  const [buckets, setBuckets] = useState<ResourceBucket[]>([]);
  const [clickedOnResource, setClickedOnResource] = useState(false);
  const [clickedResource, setClickedResource] = useState<ResourceBucket>(initialResourceBucket);
  const [loading, setLoading] = useState(true);

  const user = useSelector(userSelector);

  const fetchBuckets = () => {
    const URL = `${PROJECT_URL}/${projectID}/resource`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          setBuckets(res.data.buckets || []);
          setLoading(false);
        } else {
          Toaster.error(res.data.message || SERVER_ERROR, 'error_toaster');
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    setBuckets([]);
    fetchBuckets();
  }, [projectID]);

  return (
    <SidePrimeWrapper>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <div className="text-lg font-medium">Resource Buckets</div>

          {checkProjectAccess(user, 'manage_resource_buckets', permissionConfig, projectID) && (
            <NewResource setResources={setBuckets} resourceType="project" resourceParentID={projectID} />
          )}
        </div>
        <div>
          {buckets?.length === 0 ? (
            <div className="mt-4 mb-2">
              <Image src="/assets/new_resource.svg" alt="new task" width={200} height={200} className="mx-auto" />
              <div className="flex flex-col items-center mt-2 space-y-1">
                <div className="text-text_neutral text-md font-semibold font-['DM Sans']">No Files Shared till now</div>
                <div className="text-white/70 text-4xl font-normal mangaka">No Buckets</div>
                <div className="text-center text-text_neutral text-md font-semibold">Existing</div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full flex-wrap flex max-md:flex-col max-md:items-center flex-row gap-4">
                {buckets.map(resource => {
                  return (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      setClickedOnResource={setClickedOnResource}
                      setClickedResource={setClickedResource}
                      checkerFunc={a => checkStaticProjectAccess(user, a, projectID)}
                      smaller
                    />
                  );
                })}
              </div>
              {clickedOnResource && checkStaticProjectAccess(user, clickedResource.viewAccess, projectID) && (
                <ResourceView
                  setShow={setClickedOnResource}
                  resourceBucket={clickedResource}
                  setResources={setBuckets}
                  setClickedResourceBucket={setClickedResource}
                  setClickedOnResourceBucket={setClickedOnResource}
                  resourceType="project"
                  resourceParentID={projectID}
                  checkerFunc={a => checkStaticProjectAccess(user, a, projectID)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </SidePrimeWrapper>
  );
};

export default Resources;
