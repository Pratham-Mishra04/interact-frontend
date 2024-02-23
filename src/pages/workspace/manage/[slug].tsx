import TabMenu from '@/components/common/tab_menu';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';
import Sidebar from '@/components/common/sidebar';
import React, { useEffect, useState } from 'react';
import { initialProject } from '@/types/initials';
import { PROJECT_URL } from '@/config/routes';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { GetServerSidePropsContext } from 'next/types';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import { ArrowArcLeft } from '@phosphor-icons/react';
import Openings from '@/screens/workspace/manage_project/openings';
import Loader from '@/components/common/loader';
import Collaborators from '@/screens/workspace/manage_project/collaborators';
import Chats from '@/screens/workspace/manage_project/chats';
import WidthCheck from '@/utils/wrappers/widthCheck';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';

interface Props {
  slug: string;
}

const ManageProject = ({ slug }: Props) => {
  const [active, setActive] = useState(0);
  const [project, setProject] = useState(initialProject);
  const [loading, setLoading] = useState(true);

  const user = useSelector(userSelector);

  const fetchProject = async () => {
    const URL = `${PROJECT_URL}/${slug}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      if (res.data.project.userID != user.id && !user.editorProjects.includes(res.data.project.id))
        window.history.back();
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
      <Sidebar index={3} />
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
          <TabMenu items={['Openings', 'Collaborators', 'Chats']} active={active} setState={setActive} />
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className={`${active === 0 ? 'block' : 'hidden'}`}>
                <Openings project={project} setProject={setProject} />
              </div>
              <div className={`${active === 1 ? 'block' : 'hidden'}`}>
                <Collaborators project={project} setProject={setProject} />
              </div>
              <div className={`${active === 2 ? 'block' : 'hidden'}`}>
                <Chats project={project} />
              </div>
            </>
          )}
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

export default WidthCheck(NonOrgOnlyAndProtect(ManageProject));

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { slug } = context.query;

  return {
    props: { slug },
  };
}
