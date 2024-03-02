import Loader from '@/components/common/loader';
import OrgSidebar from '@/components/common/org_sidebar';
import AccessTree from '@/components/organization/access_tree';
import ResourceCard from '@/components/organization/resource_card';
import { ORG_SENIOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import NewResource from '@/sections/organization/resources/new_resource';
import ResourceView from '@/sections/organization/resources/resource_view';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { ResourceBucket } from '@/types';
import { initialOrganization, initialResourceBucket } from '@/types/initials';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import Toaster from '@/utils/toaster';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';
import WidthCheck from '@/utils/wrappers/widthCheck';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { Info, Plus } from '@phosphor-icons/react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Mascot from '@/components/empty_fillers/mascot';

const Resources = () => {
  const [resources, setResources] = useState<ResourceBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(initialOrganization);

  const [clickedOnResource, setClickedOnResource] = useState(false);
  const [clickedResource, setClickedResource] = useState<ResourceBucket>(initialResourceBucket);

  const [clickedOnNewResource, setClickedOnNewResource] = useState(false);
  const [clickedOnInfo, setClickedOnInfo] = useState(false);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const getResourceBuckets = () => {
    const URL = `${ORG_URL}/${currentOrgID}/resource`;
    getHandler(URL)
      .then(res => {
        if (res.statusCode === 200) {
          const resourceData = res.data.resourceBuckets || [];
          setOrganization(res.data.organization);
          setResources(resourceData);
          const rid = new URLSearchParams(window.location.search).get('rid');
          if (rid && rid != '') {
            resourceData.forEach((resource: ResourceBucket, i: number) => {
              if (rid == resource.id) setClickedOnResource(true);
            });
          }
          setLoading(false);
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

  useEffect(() => {
    getResourceBuckets();
  }, []);

  return (
    <BaseWrapper title="Resources">
      <OrgSidebar index={14} />
      <MainWrapper>
        {clickedOnNewResource && (
          <NewResource setShow={setClickedOnNewResource} organization={organization} setResources={setResources} />
        )}
        {clickedOnInfo && <AccessTree type="resource" setShow={setClickedOnInfo} />}
        <div className="w-full flex flex-col relative">
          <div className="w-full flex justify-between items-center p-base_padding">
            <div className="text-6xl font-semibold dark:text-white font-primary">Resources</div>

            <div className="flex items-center gap-2">
              {checkOrgAccess(ORG_SENIOR) && (
                <Plus
                  onClick={() => setClickedOnNewResource(true)}
                  size={42}
                  className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                  weight="regular"
                />
              )}
              <Info
                onClick={() => setClickedOnInfo(true)}
                size={42}
                className="flex-center rounded-full hover:bg-white p-2 transition-ease-300 cursor-pointer"
                weight="regular"
              />
            </div>
          </div>
          <div className="w-full flex flex-col gap-6 px-2 pb-2">
            {loading ? (
              <Loader />
            ) : resources.length > 0 ? (
              <div className="flex justify-evenly px-4">
                <div className={`w-full flex-wrap max-lg:w-[720px] flex flex-row gap-4`}>
                  {resources.map(resource => {
                    return (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        setClickedOnResource={setClickedOnResource}
                        setClickedResource={setClickedResource}
                      />
                    );
                  })}
                </div>
                {clickedOnResource && checkOrgAccess(clickedResource.viewAccess) && (
                  <ResourceView
                    setShow={setClickedOnResource}
                    resourceBucket={clickedResource}
                    setResources={setResources}
                    setClickedResourceBucket={setClickedResource}
                    setClickedOnResourceBucket={setClickedOnResource}
                  />
                )}
              </div>
            ) : (
              <Mascot message="We couldn't find any resources at the moment" />
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Resources));
