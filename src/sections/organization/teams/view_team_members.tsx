import { ORG_MANAGER, ORG_SENIOR } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import { currentOrgSelector, setCurrentOrgTeams } from '@/slices/orgSlice';
import { Organization } from '@/types';
import { initialTeam } from '@/types/initials';
import checkOrgAccess from '@/utils/funcs/access';
import Toaster from '@/utils/toaster';
import ModalWrapper from '@/wrappers/modal';
import { Pen, XCircle } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import EditTeam from './edit_team';
import ConfirmDelete from '@/components/common/confirm_delete';
import { Trash } from '@phosphor-icons/react/dist/ssr';
import { userSelector } from '@/slices/userSlice';
import { useOrgAccess } from '@/hooks/use-org-access';

interface Props {
  teamID: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
}

const MembersList = ({ teamID, setShow, setOrganization }: Props) => {
  const [team, setTeam] = useState(initialTeam);
  const [clickedOnEditTeam, setClickedOnEditTeam] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);
  const [clickedOnLeave, setClickedOnLeave] = useState(false);

  const user = useSelector(userSelector);
  const currentOrg = useSelector(currentOrgSelector);

  const getTeam = async () => {
    const URL = `/org/${currentOrg.id}/teams/${teamID}`;

    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      setTeam(res.data.team);
    } else {
      if (res.data.message) Toaster.error(res.data.message);
      else {
        Toaster.error(SERVER_ERROR);
      }
    }
  };

  const dispatch = useDispatch();

  const handleRemove = async (userID: string) => {
    const toaster = Toaster.startLoad('Removing Member...');
    const URL = `/org/${currentOrg.id}/teams/users/${team.id}`;

    const res = await deleteHandler(URL, { userID });
    if (res.statusCode === 200) {
      setOrganization(prev => {
        return {
          ...prev,
          teams: prev.teams.map(t => {
            if (t.id == team.id) return { ...t, noUsers: t.noUsers - 1 };
            return t;
          }),
          memberships: prev.memberships.map(m => {
            if (m.userID == userID)
              return {
                ...m,
                teams: m.teams.filter(t => t.id != team.id),
              };
            return m;
          }),
        };
      });
      setTeam(prev => {
        return {
          ...prev,
          noUsers: prev.noUsers - 1,
          memberships: prev.memberships.filter(m => m.userID != userID),
        };
      });
      dispatch(
        setCurrentOrgTeams(
          currentOrg.teams.map(t => {
            if (t.id == team.id)
              return {
                ...t,
                noUsers: t.noUsers - 1,
              };
            return t;
          })
        )
      );
      Toaster.stopLoad(toaster, 'Member Removed', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting Team...');
    const URL = `/org/${currentOrg.id}/teams/${team.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      setOrganization(prev => {
        return {
          ...prev,
          teams: prev.teams.filter(t => t.id != teamID),
          memberships: prev.memberships.map(m => {
            return { ...m, teams: m.teams?.filter(t => t.id != teamID) };
          }),
        };
      });
      dispatch(setCurrentOrgTeams(currentOrg.teams.filter(t => t.id != teamID)));
      setShow(false);
      Toaster.stopLoad(toaster, 'Team Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  const handleLeave = async () => {
    const toaster = Toaster.startLoad('Leaving Team...');
    const URL = `/org/${currentOrg.id}/teams/leave/${team.id}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 200) {
      setOrganization(prev => {
        return {
          ...prev,
          teams: prev.teams.map(t => {
            if (t.id == team.id) return { ...t, noUsers: t.noUsers - 1 };
            return t;
          }),
          memberships: prev.memberships.map(m => {
            if (m.userID == user.id)
              return {
                ...m,
                teams: m.teams.filter(t => t.id != team.id),
              };
            return m;
          }),
        };
      });
      setTeam(prev => {
        return {
          ...prev,
          noUsers: prev.noUsers - 1,
          memberships: prev.memberships.filter(m => m.userID != user.id),
        };
      });
      dispatch(
        setCurrentOrgTeams(
          currentOrg.teams.map(t => {
            if (t.id == team.id)
              return {
                ...t,
                noUsers: t.noUsers - 1,
              };
            return t;
          })
        )
      );
      setShow(false);
      Toaster.stopLoad(toaster, 'Left Team', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
  };

  useEffect(() => {
    getTeam();
  }, []);

  const isSenior = useOrgAccess(ORG_SENIOR);
  const isManager = useOrgAccess(ORG_MANAGER);

  return clickedOnEditTeam ? (
    <EditTeam setShow={setClickedOnEditTeam} team={team} setTeam={setTeam} setOrganization={setOrganization} />
  ) : clickedOnDelete ? (
    <ConfirmDelete handleDelete={handleDelete} setShow={setClickedOnDelete} />
  ) : clickedOnLeave ? (
    <ConfirmDelete handleDelete={handleLeave} setShow={setClickedOnLeave} title="Confirm Leave?" />
  ) : (
    <ModalWrapper setShow={setShow} width={'1/3'} top={'1/3'}>
      <div className="w-full flex items-center justify-between flex-wrap">
        <div className="text-2xl font-semibold">Team Members ({(team.memberships || []).length}) </div>
        <div className="flex-center gap-2">
          {isSenior && <Pen onClick={() => setClickedOnEditTeam(true)} className="cursor-pointer" />}
          {isManager && <Trash onClick={() => setClickedOnDelete(true)} className="cursor-pointer" />}
          {team.memberships.map(membership => membership.userID).includes(user.id) && (
            <div
              onClick={() => setClickedOnLeave(true)}
              className="text-primary_danger text-sm font-medium cursor-pointer"
            >
              Leave
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        {team.memberships.map(membership => (
          <div
            key={membership.id}
            className={`w-full h-12 px-2 bg-white ${
              isSenior && 'hover:bg-slate-100'
            } rounded-xl border-gray-400 flex items-center text-sm text-primary_black transition-ease-300`}
          >
            <div className="grow flex items-center gap-1">
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
                className="w-8 h-8 rounded-full z-[1]"
              />
              <div className="flex-center gap-2">
                <div className="font-medium text-lg">{membership.user.name}</div>
                <div className="text-xs">@{membership.user.username}</div>
              </div>
            </div>
            {isSenior && <XCircle onClick={() => handleRemove(membership.user.id)} className="cursor-pointer" />}
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
};

export default MembersList;
