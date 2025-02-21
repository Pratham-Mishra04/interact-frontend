import { Organization, Team } from '@/types';
import ModalWrapper from '@/wrappers/modal';
import React, { useState } from 'react';
import NewTeam from './new_team';
import { initialTeam } from '@/types/initials';
import Mascot from '@/components/fillers/mascot';
import { Plus } from '@phosphor-icons/react';
import moment from 'moment';
import MembersList from './view_team_members';
import checkOrgAccess from '@/utils/funcs/access';
import { ORG_SENIOR } from '@/config/constants';
import { useOrgAccess } from '@/hooks/use-org-access';

interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  organization: Organization;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const TeamsView = ({ setShow, organization, setOrganization }: Props) => {
  const [clickedOnNewTeam, setClickedOnNewTeam] = useState(false);
  const [clickedOnViewTeam, setClickedOnViewTeam] = useState(false);
  const [clickedTeam, setClickedTeam] = useState(initialTeam);

  const isSenior = useOrgAccess(ORG_SENIOR);

  return clickedOnNewTeam ? (
    <NewTeam organization={organization} setShow={setClickedOnNewTeam} setOrganization={setOrganization} />
  ) : clickedOnViewTeam ? (
    <MembersList setShow={setClickedOnViewTeam} teamID={clickedTeam.id} setOrganization={setOrganization} />
  ) : (
    <ModalWrapper setShow={setShow} top={'1/3'}>
      <div className="w-full flex items-center justify-between mb-2">
        <div className="text-3xl font-semibold">Teams</div>
        {isSenior && (
          <div className="w-fit flex-center">
            <Plus onClick={() => setClickedOnNewTeam(true)} className="cursor-pointer" size={24} />
          </div>
        )}
      </div>
      {organization.teams && organization.teams.length > 0 ? (
        organization.teams.map(team => (
          <div
            key={team.id}
            onClick={() => {
              setClickedTeam(team);
              setClickedOnViewTeam(true);
            }}
            className="w-full p-2 rounded-lg cursor-pointer"
            style={{ backgroundColor: team.color }}
          >
            <div className="font-medium">{team.title}</div>
            <div className="w-full flex items-center justify-between">
              <div className="text-sm">{team.noUsers} Members</div>
              <div className="text-xs">Created on {moment(team.createdAt).format('DD MMMM YY')}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="pb-8">
          <Mascot message="No Teams Yet." />
        </div>
      )}
    </ModalWrapper>
  );
};

export default TeamsView;
