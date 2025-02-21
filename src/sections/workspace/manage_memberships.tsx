import { DialogHeader } from '@/components/ui/dialog';
import { SERVER_ERROR } from '@/config/errors';
import { INVITATION_URL, MEMBERSHIP_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gear, X } from '@phosphor-icons/react';
import Image from 'next/image';
import moment from 'moment';
import { ORG_MANAGER, PROJECT_MANAGER, PROJECT_OWNER } from '@/config/constants';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { currentOrgSelector } from '@/slices/orgSlice';
import checkOrgAccess, { checkProjectAccess } from '@/utils/funcs/access';
import deleteHandler from '@/handlers/delete_handler';
import getInvitationStatus, { getInvitationStatusColor } from '@/utils/funcs/invitation';
import { getRoleColor } from '@/utils/funcs/membership';
import EditCollaborator from './manage_project/edit_collaborator';
import { useOrgAccess } from '@/hooks/use-org-access';

const ManageMemberships = ({
  project,
  setProject,
  org = false,
}: {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  org?: boolean;
}) => {
  const currentOrgID = useSelector(currentOrgSelector).id;

  const handleRemoveMember = async (membershipID: string) => {
    const toaster = Toaster.startLoad('Removing Collaborator...');

    const URL = org
      ? `${ORG_URL}/${currentOrgID}/project/membership/${membershipID}`
      : `${MEMBERSHIP_URL}/${membershipID}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setProject(prev => {
        return {
          ...prev,
          memberships: prev.memberships.filter(m => m.id != membershipID),
        };
      });
      Toaster.stopLoad(toaster, 'Collaborator Removed', 1);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  //TODO make org managers be able to do this
  const handleWithdrawInvitation = async (invitationID: string) => {
    const toaster = Toaster.startLoad('Withdrawing Invitation...');

    const URL = `${INVITATION_URL}/withdraw/${invitationID}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      setProject(prev => {
        return {
          ...prev,
          invitations: prev.invitations.filter(inv => inv.id != invitationID),
        };
      });
      // setClickedOnWithdraw(false);
      Toaster.stopLoad(toaster, 'Invitation Withdrawn', 1);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const user = useSelector(userSelector);

  const isManager = useOrgAccess(ORG_MANAGER);

  const ManageMembers = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {project.memberships?.map(membership => (
          <TableRow key={membership.id}>
            <TableCell className="flex-center gap-2">
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
                placeholder="blur"
                blurDataURL={membership.user.profilePicBlurHash || 'no-hash'}
                className="w-6 h-6 rounded-full z-[1]"
              />
              <div className="w-[calc(100%-24px)] flex max-md:flex-col md:items-center flex-wrap gap-1 max-md:gap-0">
                <div className="font-medium text-lg max-md:text-sm line-clamp-1">{membership.user.name}</div>
                <div className="text-xs max-md:text-xxs">@{membership.user.username}</div>
              </div>
            </TableCell>
            <TableCell>{membership.title}</TableCell>
            <TableCell>
              <div
                className="w-fit px-3 max-md:px-2 py-1 text-xs max-md:text-xxs font-medium rounded-full dark:text-primary_black"
                style={{ backgroundColor: getRoleColor(membership.role) }}
              >
                {membership.role}
              </div>
            </TableCell>
            <TableCell>{moment(membership.createdAt).format('DD MMMM, YYYY')}</TableCell>
            <TableCell className="flex items-center justify-end gap-4">
              {user.id != membership.userID && (
                <>
                  {checkProjectAccess(user, PROJECT_MANAGER, project.id) && membership.role != PROJECT_MANAGER && (
                    <EditCollaborator membership={membership} project={project} setProject={setProject} org={org} />
                  )}
                  {(checkProjectAccess(user, PROJECT_OWNER, project.id) ||
                    (checkProjectAccess(user, PROJECT_MANAGER, project.id) && membership.role != PROJECT_MANAGER) ||
                    (org && isManager)) && (
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <X size={20} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from Project?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMember(membership.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const ManageInvitations = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Invited By</TableHead>
          <TableHead>Invited On</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {project.invitations?.map(invitation => (
          <TableRow key={invitation.id}>
            <TableCell className="flex-center gap-2">
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${invitation.user.profilePic}`}
                placeholder="blur"
                blurDataURL={invitation.user.profilePicBlurHash || 'no-hash'}
                className="w-6 h-6 rounded-full z-[1]"
              />
              <div className="w-[calc(100%-24px)] flex max-md:flex-col md:items-center flex-wrap gap-1 max-md:gap-0">
                <div className="font-medium text-lg max-md:text-sm line-clamp-1">{invitation.user.name}</div>
                <div className="text-xs max-md:text-xxs">@{invitation.user.username}</div>
              </div>
            </TableCell>
            <TableCell>{invitation.title}</TableCell>
            <TableCell>
              <div
                className="w-fit px-3 max-md:px-2 py-1 text-xs max-md:text-xxs font-medium rounded-full dark:text-primary_black"
                style={{ backgroundColor: getInvitationStatusColor(invitation.status) }}
              >
                {getInvitationStatus(invitation.status)}
              </div>
            </TableCell>
            <TableCell className="flex-center gap-2">
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={`${USER_PROFILE_PIC_URL}/${invitation.sender.profilePic}`}
                placeholder="blur"
                blurDataURL={invitation.sender.profilePicBlurHash || 'no-hash'}
                className="w-6 h-6 rounded-full z-[1]"
              />
              <div className="w-[calc(100%-24px)] flex max-md:flex-col md:items-center flex-wrap gap-1 max-md:gap-0">
                <div className="font-medium max-md:text-sm line-clamp-1">{invitation.sender.name}</div>
                <div className="text-xxs">@{invitation.sender.username}</div>
              </div>
            </TableCell>
            <TableCell>{moment(invitation.createdAt).format('DD MMMM, YYYY')}</TableCell>
            <TableCell className="flex items-center justify-end gap-4">
              {checkProjectAccess(user, PROJECT_MANAGER, project.id) && (
                <AlertDialog>
                  <AlertDialogTrigger>
                    <X size={20} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Withdraw Project Request?</AlertDialogTitle>
                      <AlertDialogDescription>You cannot revert this action.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleWithdrawInvitation(invitation.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {project.invitations?.length == 0 && <TableCaption>No Project Join Invitations.</TableCaption>}
    </Table>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Gear className="cursor-pointer" size={20} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[60%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Manage Project</DialogTitle>
          <DialogDescription>Manage your project members.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="w-full h-12">
            <TabsTrigger className="w-1/2 py-2" value="members">
              Members
            </TabsTrigger>
            <TabsTrigger className="w-1/2 py-2" value="invitations">
              Invitations
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members">
            <ManageMembers />
          </TabsContent>
          <TabsContent value="invitations">
            <ManageInvitations />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMemberships;
