import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import { SERVER_ERROR } from '@/config/errors';
import { COMMUNITY_URL } from '@/config/routes';
import { Community, CommunityRole, PermissionConfig } from '@/types';
import Toaster from '@/utils/toaster';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COMMUNITY_ADMIN, COMMUNITY_MEMBER, COMMUNITY_MODERATOR } from '@/config/constants';
import postHandler from '@/handlers/post_handler';
import { checkCommunityAccess } from '@/utils/funcs/access';
import { userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';

interface Props {
  community: Community;
  permissionConfig: PermissionConfig | undefined;
  setPermissionConfig: React.Dispatch<React.SetStateAction<PermissionConfig | undefined>>;
}

const ViewPermissions = ({ community, permissionConfig, setPermissionConfig }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChangeRole = async (action: string, role: CommunityRole) => {
    const URL = `${COMMUNITY_URL}/${community.id}/permissions`;
    const res = await postHandler(URL, { action, role });

    if (res.statusCode === 200) {
      setPermissionConfig(prev => (prev ? { ...prev, [action]: role } : undefined));
      Toaster.success('Permission Updated');
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  const user = useSelector(userSelector);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsDialogOpen(true)}>View Permissions</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">View Permissions</DialogTitle>
          <DialogDescription>Manage your community permissions.</DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Minimum Role Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissionConfig &&
              Object.entries(permissionConfig).map(([action, role]) => (
                <TableRow key={action}>
                  <TableCell className="capitalize">{action.replace('_', ' ')}</TableCell>
                  <TableCell className="w-full flex justify-end text-right">
                    {checkCommunityAccess(user, community.id, 'manage_permissions', permissionConfig) ? (
                      <Select
                        defaultValue={role}
                        onValueChange={value => handleChangeRole(action, value as CommunityRole)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={COMMUNITY_MEMBER}>{COMMUNITY_MEMBER}</SelectItem>
                          <SelectItem value={COMMUNITY_ADMIN}>{COMMUNITY_ADMIN}</SelectItem>
                          <SelectItem value={COMMUNITY_MODERATOR}>{COMMUNITY_MODERATOR}</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      role
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPermissions;
