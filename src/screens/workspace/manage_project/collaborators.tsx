import { Project } from '@/types';
import { Plus } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import CollaboratorCard from '@/components/workspace/manage_project/collaborator_card';
import InvitationCard from '@/components/workspace/manage_project/invitation_card';
import AddCollaborators from '@/sections/workspace/manage_project/add_collaborators';
import checkOrgAccess from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';

interface Props {
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
  org?: boolean;
}

const Collaborators = ({ project, setProject, org = false }: Props) => {
  const [clickedOnAddCollaborator, setClickedOnAddCollaborator] = useState(false);
  const [clickedOnInvitations, setClickedOnInvitations] = useState(false);

  const user = useSelector(userSelector);

  return (
    <div className="w-[50vw] max-lg:w-screen mx-auto flex flex-col gap-8">
      {clickedOnAddCollaborator && (
        <AddCollaborators setShow={setClickedOnAddCollaborator} project={project} setProject={setProject} org={org} />
      )}
      <div className="w-taskbar max-lg:w-[95%] h-taskbar mx-auto flex gap-2 font-primary text-gray-200 text-lg">
        {(project.userID == user.id ||
          user.managerProjects.includes(project.id) ||
          (org && checkOrgAccess(ORG_MANAGER))) && (
          <div
            onClick={() => setClickedOnAddCollaborator(true)}
            className="w-4/5 max-lg:w-2/3 h-full text-gray-400 dark:text-gray-200 bg-white dark:bg-gradient-to-l dark:from-dark_primary_gradient_start dark:to-dark_primary_gradient_end px-4 max-lg:px-2 py-3 rounded-lg cursor-pointer border-gray-300 border-[1px] dark:border-0 shadow-md hover:shadow-lg transition-ease-300 dark:hover:shadow-outer dark:shadow-outer flex justify-between items-center"
          >
            <div className="pl-2 max-lg:text-sm">Add Collaborators</div>
            <Plus
              size={36}
              className="dark:text-gray-200 max-lg:w-8 max-lg:h-8 flex-center rounded-full hover:bg-primary_comp_hover dark:hover:bg-[#e9e9e933] p-2 transition-ease-300"
              weight="regular"
            />
          </div>
        )}

        <div
          onClick={() => setClickedOnInvitations(prev => !prev)}
          className={`w-1/5 max-lg:w-1/3  h-full max-lg:text-sm text-gray-400 dark:text-gray-200 ${
            clickedOnInvitations ? 'bg-primary_comp_hover dark:bg-white text-primary_text dark:text-white' : 'bg-white'
          }  dark:bg-gradient-to-l dark:from-dark_primary_gradient_start dark:to-dark_primary_gradient_end px-4 max-lg:px-2 py-3 rounded-lg cursor-pointer border-gray-300 border-[1px] dark:border-0 shadow-md hover:shadow-lg transition-ease-300 dark:hover:shadow-outer dark:shadow-outer flex justify-between items-center`}
        >
          <div
            className={`w-full h-full rounded-lg ${
              clickedOnInvitations ? 'dark:bg-[#0E0C2A59] dark:shadow-inner' : ''
            } flex-center transition-ease-200`}
          >
            Invitations
          </div>
        </div>
      </div>

      {clickedOnInvitations
        ? project.invitations && (
            <div className="w-full flex flex-col gap-2 max-lg:px-4 pb-4">
              {project.invitations.map(invitation => {
                return (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    project={project}
                    setProject={setProject}
                    org={org}
                  />
                );
              })}
            </div>
          )
        : project.memberships && (
            <div className="w-full flex flex-col gap-2 max-lg:px-4 pb-4">
              {project.memberships.map(membership => {
                return (
                  <CollaboratorCard
                    key={membership.id}
                    membership={membership}
                    project={project}
                    setProject={setProject}
                    org={org}
                  />
                );
              })}
            </div>
          )}
    </div>
  );
};

export default Collaborators;
