import TabMenu from '@/components/common/tab_menu';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import React, { useEffect, useState } from 'react';
import { initialProject } from '@/types/initials';
import { ORG_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { GetServerSidePropsContext } from 'next/types';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { ArrowArcLeft } from '@phosphor-icons/react';
import Openings from '@/screens/workspace/manage_project/openings';
import Loader from '@/components/common/loader';
import Protect from '@/utils/wrappers/protect';
import Collaborators from '@/screens/workspace/manage_project/collaborators';
import Chats from '@/screens/workspace/manage_project/chats';
import WidthCheck from '@/utils/wrappers/widthCheck';
import { currentOrgIDSelector } from '@/slices/orgSlice';
import { ORG_SENIOR } from '@/config/constants';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import OrgSidebar from '@/components/common/org_sidebar';

interface Props {
  slug: string;
}

const ManageProject = ({ slug }: Props) => {
  const [active, setActive] = useState(0);
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(true);

  const user = useSelector(userSelector);

  const currentOrgID = useSelector(currentOrgIDSelector);

  const fetchProject = async () => {
    const URL = `${ORG_URL}/${currentOrgID}/projects/${slug}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      if (!checkOrgAccess(ORG_SENIOR) && !user.managerProjects.includes(project.id)) window.history.back();
      setProject(res.data.project);
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchProject();
  }, [slug]);

  return (
    <BaseWrapper title="Manage Project">
      <OrgSidebar index={3} />
      <MainWrapper>
        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-[50vw] max-lg:w-[75vw] max-md:w-[95%] flex items-start gap-3 p-base_padding pl-0 pt-28">
            <ArrowArcLeft
              onClick={() => window.history.back()}
              className="w-10 h-10 p-2 dark:text-white dark:bg-dark_primary_comp_hover rounded-full cursor-pointer"
              size={40}
            />
            <div className="text-4xl font-semibold dark:text-white font-primary">Manage Project</div>
          </div>
          <TabMenu items={['Openings', 'Collaborators']} active={active} setState={setActive} />
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className={`${active === 0 ? 'block' : 'hidden'}`}>
                <Openings project={project} setProject={setProject} org={true} />
              </div>
              <div className={`${active === 1 ? 'block' : 'hidden'}`}>
                <Collaborators project={project} setProject={setProject} org={true} />
              </div>
              {/* <div className={`${active === 2 ? 'block' : 'hidden'}`}>
                <Chats project={project} />
              </div> */}
            </>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(Protect(ManageProject));

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { slug } = context.query;

  return {
    props: { slug },
  };
}
