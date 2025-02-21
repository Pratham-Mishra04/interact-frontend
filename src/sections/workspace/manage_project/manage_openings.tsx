import { DialogHeader } from '@/components/ui/dialog';
import { SERVER_ERROR } from '@/config/errors';
import { MEMBERSHIP_URL, OPENING_URL, ORG_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { Project } from '@/types';
import Toaster from '@/utils/toaster';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gear, PencilSimple, X } from '@phosphor-icons/react';
import moment from 'moment';
import { useSelector } from 'react-redux';
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
import { currentOrgSelector } from '@/slices/orgSlice';
import deleteHandler from '@/handlers/delete_handler';
import EditOpening from './edit_opening';

const ManageOpenings = ({
  project,
  setProject,
  org = false,
}: {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  org?: boolean;
}) => {
  const [clickedMembershipID, setClickedMembershipID] = useState<string | null>(null);
  const [clickedMembershipTitle, setClickedMembershipTitle] = useState<string>('');
  const [clickedMembershipRole, setClickedMembershipRole] = useState<string | null>(null);
  const currentOrgID = useSelector(currentOrgSelector).id;

  const handleDeleteOpening = async (openingID: string) => {
    const toaster = Toaster.startLoad('Deleting Opening...');

    const URL = org ? `${ORG_URL}/${currentOrgID}/openings/${openingID}` : `${OPENING_URL}/${openingID}`;

    const res = await deleteHandler(URL);
    if (res.statusCode === 204) {
      if (setProject)
        setProject(prev => {
          return {
            ...prev,
            openings: prev.openings.filter(o => o.id != openingID),
          };
        });
      Toaster.stopLoad(toaster, 'Opening Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleEditOpening = async () => {
    const title = clickedMembershipTitle;
    const role = clickedMembershipRole;

    if (!title || !role) return;

    const toaster = Toaster.startLoad('Editing the membership...');

    const formData = {
      title,
      role,
    };

    const URL = org
      ? `${ORG_URL}/${currentOrgID}/project/membership/${clickedMembershipID}`
      : `${MEMBERSHIP_URL}/${clickedMembershipID}`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      setProject(prev => {
        return {
          ...prev,
          memberships: prev.memberships.map(m => {
            if (m.id == clickedMembershipID)
              return {
                ...m,
                title,
                role,
              };
            else return m;
          }),
        };
      });
      setClickedMembershipID(null);
      setClickedMembershipTitle('');
      setClickedMembershipRole(null);
      Toaster.stopLoad(toaster, 'Membership Edited', 1);
    } else {
      Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Gear className="cursor-pointer" size={20} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[60%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Manage Openings</DialogTitle>
          <DialogDescription>Manage your project openings.</DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Number of Applications</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.openings?.map(opening => (
              <TableRow key={opening.id}>
                <TableCell>{opening.title}</TableCell>
                <TableCell>{opening.active ? 'Yes' : 'No'}</TableCell>
                <TableCell>{opening.noApplications}</TableCell>
                <TableCell>{moment(opening.createdAt).format('DD MMMM, YYYY')}</TableCell>
                <TableCell className="flex items-center justify-end gap-4">
                  <EditOpening opening={opening} project={project} setProject={setProject} org={org} />
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <X size={20} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Opening?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteOpening(opening.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ManageOpenings;
