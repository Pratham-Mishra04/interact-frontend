import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { Application } from '@/types';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import { ArrowArcLeft, SlidersHorizontal } from '@phosphor-icons/react';
import { GetServerSidePropsContext } from 'next/types';
import React, { useEffect, useState } from 'react';
import ApplicationCard from '@/components/workspace/manage_project/application_card';
import ApplicationView from '@/sections/workspace/manage_project/application_view';
import WidthCheck from '@/utils/wrappers/widthCheck';
import { useSelector } from 'react-redux';
import OrgSidebar from '@/components/common/org_sidebar';
import { currentOrgSelector } from '@/slices/orgSlice';
import OrgMembersOnlyAndProtect from '@/utils/wrappers/org_members_only';

interface Props {
  oid: string;
}

const Applications = ({ oid }: Props) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [clickedOnFilter, setClickedOnFilter] = useState(false);
  const [clickedOnApplication, setClickedOnApplication] = useState(false);
  const [clickedApplicationID, setClickedApplicationID] = useState(-1);

  const currentOrg = useSelector(currentOrgSelector);

  const fetchApplications = async () => {
    const URL = `/org/${currentOrg.id}/org_openings/applications/${oid}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const applicationData = res.data.applications || [];
      setApplications(applicationData);
      setFilteredApplications(applicationData);
      const aid = new URLSearchParams(window.location.search).get('aid');
      if (aid && aid != '') {
        applicationData.forEach((application: Application, id: number) => {
          if (aid == application.id) {
            setClickedApplicationID(id);
            setClickedOnApplication(true);
          }
        });
      }
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const filterApplications = (status: number) => {
    setFilterStatus(status);
    setClickedOnApplication(false);
    if (status == 0) setFilteredApplications(applications);
    else setFilteredApplications(applications.filter(application => application.status == status));
  };

  useEffect(() => {
    fetchApplications();
  }, [oid]);

  // useEffect(() => {
  //   if (clickedApplicationID != -1)
  //     router.push({
  //       pathname: router.pathname,
  //       query: { ...router.query, aid: filteredApplications[clickedApplicationID].id },
  //     });
  // }, [clickedApplicationID]);

  return (
    <BaseWrapper title={`Applications | ${currentOrg.title}`}>
      <OrgSidebar index={15}></OrgSidebar>

      <MainWrapper>
        <div className="w-full flex flex-col gap-4">
          <div className="w-full flex justify-between p-base_padding">
            <div className="flex gap-3">
              <ArrowArcLeft
                onClick={() => window.history.back()}
                className="w-10 h-10 p-2 dark:bg-dark_primary_comp_hover rounded-full cursor-pointer"
                size={40}
              />
              <div className="text-4xl font-semibold dark:text-white font-primary">Applications</div>
            </div>

            <div className="relative">
              <div
                onClick={() => setClickedOnFilter(prev => !prev)}
                className={`w-28 flex items-center justify-center gap-2 text-xl font-medium cursor-pointer p-2 rounded-xl ${
                  clickedOnFilter ? 'bg-white' : 'hover:bg-white'
                } transition-ease-300`}
              >
                Filters <SlidersHorizontal size={24} />
              </div>
              {clickedOnFilter && (
                <div
                  className={`absolute top-12 right-0 ${
                    clickedOnApplication ? 'bg-gray-50' : ''
                  } rounded-md flex flex-col gap-1 animate-fade_third z-50`}
                >
                  <div
                    onClick={() => filterApplications(0)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == 0 ? 'bg-white ' : 'hover:bg-gray-100'
                    } text-center cursor-default transition-ease-300`}
                  >
                    All
                  </div>
                  <div
                    onClick={() => filterApplications(2)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == 2 ? 'bg-white ' : 'hover:bg-gray-100'
                    } text-center cursor-default transition-ease-300`}
                  >
                    Accepted
                  </div>
                  <div
                    onClick={() => filterApplications(1)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == 1 ? 'bg-white ' : 'hover:bg-gray-100'
                    } text-center cursor-default transition-ease-300`}
                  >
                    Shortlisted
                  </div>
                  <div
                    onClick={() => filterApplications(-1)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == -1 ? 'bg-white ' : 'hover:bg-gray-100'
                    } text-center cursor-default transition-ease-300`}
                  >
                    Rejected
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex flex-col gap-6 px-2 py-2">
            {loading ? (
              <Loader />
            ) : filteredApplications.length > 0 ? (
              <div className="flex justify-evenly px-4">
                <div
                  className={`${clickedOnApplication ? 'w-[40%]' : 'w-[720px]'} max-md:w-[720px] flex flex-col gap-4`}
                >
                  {filteredApplications.map((application, i) => {
                    return (
                      <ApplicationCard
                        key={application.id}
                        index={i}
                        application={application}
                        applications={filteredApplications}
                        clickedApplicationID={clickedApplicationID}
                        setClickedOnApplication={setClickedOnApplication}
                        setClickedApplicationID={setClickedApplicationID}
                      />
                    );
                  })}
                </div>
                {clickedOnApplication && (
                  <ApplicationView
                    applicationIndex={clickedApplicationID}
                    applications={filteredApplications}
                    setShow={setClickedOnApplication}
                    setApplications={setApplications}
                    setFilteredApplications={setFilteredApplications}
                    org={true}
                  />
                )}
              </div>
            ) : (
              <div className="w-full text-center text-xl font-medium">No Applications found :)</div>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(OrgMembersOnlyAndProtect(Applications));

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { oid } = context.query;

  return {
    props: { oid },
  };
}
