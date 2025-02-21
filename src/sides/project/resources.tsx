import ResourceCard from '@/components/organization/resource_card';
import { PROJECT_EDITOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { PROJECT_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import NewResource from '@/sections/resources/new_resource';
import ResourceView from '@/sections/resources/resource_view';
import { userSelector } from '@/slices/userSlice';
import { Project, ResourceBucket } from '@/types';
import { initialResourceBucket } from '@/types/initials';
import { checkProjectAccess } from '@/utils/funcs/access';
import Toaster from '@/utils/toaster';
import { SidePrimeWrapper } from '@/wrappers/side';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  projectID: string;
}

const Resources = ({ projectID }: Props) => {
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

          {checkProjectAccess(user, PROJECT_EDITOR, projectID) && (
            <NewResource setResources={setBuckets} resourceType="project" resourceParentID={projectID} />
          )}
        </div>
        <div>
          {buckets?.length === 0 && !loading ? (
            <></>
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
                      checkerFunc={a => checkProjectAccess(user, a, projectID)}
                      smaller
                    />
                  );
                })}
              </div>
              {clickedOnResource && checkProjectAccess(user, clickedResource.viewAccess, projectID) && (
                <ResourceView
                  setShow={setClickedOnResource}
                  resourceBucket={clickedResource}
                  setResources={setBuckets}
                  setClickedResourceBucket={setClickedResource}
                  setClickedOnResourceBucket={setClickedOnResource}
                  resourceType="project"
                  resourceParentID={projectID}
                  checkerFunc={a => checkProjectAccess(user, a, projectID)}
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
