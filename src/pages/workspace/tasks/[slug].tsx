import Sidebar from '@/components/common/sidebar';
import BaseWrapper from '@/wrappers/base';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import ProjectTasks from '@/screens/project_tasks';

interface Props {
  slug: string;
}

const Tasks = ({ slug }: Props) => {
  return (
    <BaseWrapper title="Tasks">
      <Sidebar index={2} />
      <ProjectTasks slug={slug} />
    </BaseWrapper>
  );
};

export default NonOrgOnlyAndProtect(Tasks);

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { slug } = context.query;

  return {
    props: { slug },
  };
}
