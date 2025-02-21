import { MEMBERSHIP_URL, ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Membership, Project } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import Image from 'next/image';
import patchHandler from '@/handlers/patch_handler';
import { ORG_MANAGER, PROJECT_EDITOR, PROJECT_MANAGER, PROJECT_MEMBER } from '@/config/constants';
import { SERVER_ERROR } from '@/config/errors';
import { currentOrgSelector } from '@/slices/orgSlice';
import { useSelector } from 'react-redux';
import { userIDSelector } from '@/slices/userSlice';
import checkOrgAccess from '@/utils/funcs/access';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PencilSimple } from '@phosphor-icons/react';
import Input from '@/components/form/input';
import { Button } from '@/components/ui/button';
import { useOrgAccess } from '@/hooks/use-org-access';

interface Props {
  membership: Membership;
  project: Project;
  setProject?: React.Dispatch<React.SetStateAction<Project>>;
  org?: boolean;
}

const EditCollaborator = ({ membership, project, setProject, org = false }: Props) => {
  const [title, setTitle] = useState(membership.title);
  const [role, setRole] = useState(membership.role);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const userID = useSelector(userIDSelector);

  const currentOrgID = useSelector(currentOrgSelector).id;

  const handleSubmit = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing the membership...');

    const formData = {
      title,
      role,
    };

    const URL = org
      ? `${ORG_URL}/${currentOrgID}/project/membership/${membership.id}`
      : `${MEMBERSHIP_URL}/${membership.id}`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      if (setProject)
        setProject(prev => {
          return {
            ...prev,
            memberships: prev.memberships.map(m => {
              if (m.id == membership.id)
                return {
                  ...m,
                  title,
                  role,
                };
              else return m;
            }),
          };
        });
      Toaster.stopLoad(toaster, 'Membership Edited', 1);
      setIsDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
    setMutex(false);
  };

  const isManager = useOrgAccess(ORG_MANAGER);

  const canEditRoles =
    project.userID == userID || (org && isManager)
      ? [PROJECT_MEMBER, PROJECT_EDITOR, PROJECT_MANAGER]
      : [PROJECT_MEMBER, PROJECT_EDITOR];

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <PencilSimple className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Membership</DialogTitle>
        </DialogHeader>
        <Input label="Title" val={title} setVal={setTitle} maxLength={25} placeholder={membership.title} />
        <Select onValueChange={val => setRole(val)} defaultValue={membership.role}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {canEditRoles.map((c, i) => {
              return (
                <SelectItem key={i} value={c}>
                  {c}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={handleSubmit} variant="outline">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCollaborator;
