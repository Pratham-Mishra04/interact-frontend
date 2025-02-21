import Loader from '@/components/common/loader';
import { SERVER_ERROR } from '@/config/errors';
import { OPENING_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Application } from '@/types';
import Toaster from '@/utils/toaster';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import { ArrowArcLeft, SlidersHorizontal } from '@phosphor-icons/react';
import { GetServerSidePropsContext } from 'next/types';
import React, { useEffect, useState } from 'react';
import ApplicationView from '@/sections/workspace/manage_project/application_view';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import OrgSidebar from '@/components/common/org_sidebar';
import Protect from '@/utils/wrappers/protect';
import OrderMenu from '@/components/common/order_menu';
import ApplicationsTable from '@/components/tables/applications';
import { initialOpening } from '@/types/initials';

interface Props {
  oid: string;
}

const Applications = ({ oid }: Props) => {
  const [opening, setOpening] = useState(initialOpening);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState(0);
  const [loading, setLoading] = useState(true);

  const [clickedOnFilter, setClickedOnFilter] = useState(false);
  const [clickedOnApplication, setClickedOnApplication] = useState(false);
  const [clickedApplicationID, setClickedApplicationID] = useState(-1);

  const fetchApplications = async () => {
    const URL = `${OPENING_URL}/applications/${oid}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const applicationData = res.data.applications || [];
      setOpening(res.data.opening || initialOpening);
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

  const user = useSelector(userSelector);

  return (
    <BaseWrapper title="Applications">
      {user.isOrganization ? <OrgSidebar index={2} /> : <Sidebar index={2} />}
      <MainWrapper>
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex justify-between p-base_padding">
            <div className="flex gap-3">
              <ArrowArcLeft
                onClick={() => window.history.back()}
                className="w-10 h-10 p-2 dark:bg-dark_primary_comp_hover rounded-full max-md:hidden cursor-pointer"
                size={40}
              />
              <div className="text-5xl font-semibold dark:text-white font-primary">Applications</div>
            </div>

            <div className="relative max-md:hidden">
              <div
                onClick={() => setClickedOnFilter(prev => !prev)}
                className={`w-28 flex items-center justify-center gap-2 text-xl font-medium cursor-pointer p-2 rounded-xl ${
                  clickedOnFilter ? 'bg-white' : 'hover:bg-white'
                } transition-ease-300`}
              >
                Filters <SlidersHorizontal size={24} />
              </div>
              {clickedOnFilter && (
                <div className="absolute top-12 right-0 bg-gray-100 rounded-md flex flex-col gap-1 animate-fade_third z-50">
                  <div
                    onClick={() => filterApplications(0)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == 0 ? 'bg-white text-primary_text' : 'hover:bg-white'
                    } text-center cursor-default transition-ease-300`}
                  >
                    All
                  </div>
                  <div
                    onClick={() => filterApplications(2)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == 2 ? 'bg-white text-primary_text' : 'hover:bg-white'
                    } text-center cursor-default transition-ease-300`}
                  >
                    Accepted
                  </div>
                  <div
                    onClick={() => filterApplications(1)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == 1 ? 'bg-white text-primary_text' : 'hover:bg-white'
                    } text-center cursor-default transition-ease-300`}
                  >
                    Shortlisted
                  </div>
                  <div
                    onClick={() => filterApplications(-1)}
                    className={`w-28 p-2 rounded-lg ${
                      filterStatus == -1 ? 'bg-white text-primary_text' : 'hover:bg-white'
                    } text-center cursor-default transition-ease-300`}
                  >
                    Rejected
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            {loading ? (
              <Loader />
            ) : filteredApplications.length > 0 ? (
              <>
                <ApplicationsTable
                  applications={filteredApplications}
                  setClickedOnApplication={setClickedOnApplication}
                  setClickedApplicationID={setClickedApplicationID}
                />

                {clickedOnApplication && (
                  <ApplicationView
                    applicationIndex={clickedApplicationID}
                    applications={filteredApplications}
                    setShow={setClickedOnApplication}
                    setApplications={setApplications}
                    setFilteredApplications={setFilteredApplications}
                    projectID={opening.projectID}
                  />
                )}
              </>
            ) : (
              <div className="w-full text-center text-xl font-medium">No Applications found :)</div>
            )}
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default Protect(Applications);

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { oid } = context.query;

  return {
    props: { oid },
  };
}
