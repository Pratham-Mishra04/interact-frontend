import { COMMUNITY_URL } from '@/config/routes';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '../ui/button';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { useDispatch } from 'react-redux';
import { setCommunityMemberships, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import { CommunityAccess } from '@/types';

const CommunityJoinBtn = ({
  communityID,
  communityAccess,
  smaller = true,
}: {
  communityID: string;
  communityAccess: CommunityAccess;
  smaller?: boolean;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const user = useSelector(userSelector);

  const joinedCommunities = user.communityMemberships?.map(m => m.communityID) || [];

  const dispatch = useDispatch();

  const handleJoin = async () => {
    if (!user.id) {
      Toaster.error('You are Not Logged In.');
      return;
    }

    const toaster = Toaster.startLoad('Joining Community');

    const URL = `${COMMUNITY_URL}/${communityID}/join`;

    const res = await postHandler(URL, {});
    if (res.statusCode === 200) {
      const membership = res.data.membership;
      if (membership) {
        dispatch(setCommunityMemberships([...(user.communityMemberships || []), membership]));
        Toaster.stopLoad(toaster, 'Joined the Community', 1);
      } else Toaster.stopLoad(toaster, 'Requested to join the Community', 1);

      setDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleLeave = async () => {
    const toaster = Toaster.startLoad('Leaving Community');

    const URL = `${COMMUNITY_URL}/${communityID}/leave`;

    const res = await postHandler(URL, {});
    if (res.statusCode === 204) {
      dispatch(setCommunityMemberships(user.communityMemberships.filter(m => m.communityID != communityID)));
      Toaster.stopLoad(toaster, 'Left the Community', 1);
      setDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleClick = () =>
    communityAccess.toLowerCase() == 'open'
      ? handleJoin()
      : communityAccess.toLowerCase() == 'restricted'
      ? setDialogOpen(true)
      : Toaster.error('This community is closed');

  return joinedCommunities.includes(communityID) ? (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger>
        {smaller ? (
          <div className="w-16 h-fit py-1 text-sm font-medium bg-primary_comp flex-center rounded-xl border-[1px] cursor-pointer">
            Joined
          </div>
        ) : (
          <Button className="w-32 text-sm font-medium hover:bg-priority_high hover:text-black transition-ease-300">
            Joined
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Community?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If the community is restricted, you will have to request again to join.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={handleLeave} variant="destructive">
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {smaller ? (
        <div
          onClick={handleClick}
          className="w-16 h-fit py-1 text-sm font-medium bg-primary_comp hover:bg-primary_comp_hover flex-center rounded-xl border-[1px] cursor-pointer transition-ease-300"
        >
          Join
        </div>
      ) : (
        <Button onClick={handleClick} disabled={communityAccess == 'closed'}>
          {communityAccess == 'open' ? 'Join' : communityAccess == 'restricted' ? 'Request to Join' : 'Closed'}
        </Button>
      )}

      <DialogContent className="sm:max-w-md min-w-[30%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Join Community</DialogTitle>
          <DialogDescription>This community is {communityAccess}.</DialogDescription>
        </DialogHeader>
        <div className="w-4/5 mx-auto text-primary_black dark:text-white text-center">
          You need to request to join, and the moderators will review your request
        </div>
        <DialogFooter className="w-full flex-center">
          <Button onClick={handleJoin} type="button" variant="outline" className="w-1/2">
            Request to join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityJoinBtn;
