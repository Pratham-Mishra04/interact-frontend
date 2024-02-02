import React, { useState, useEffect } from 'react';
import { SERVER_ERROR } from '@/config/errors';
import { INVITATION_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import { Invitation } from '@/types';
import Toaster from '@/utils/toaster';
import Loader from '@/components/common/loader';
import EventInvitationCard from '@/components/invitations/event_invitation_card';
interface Props {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewInvitations = ({ setShow }: Props) => {
  const [loading, setLoading] = useState(true);
  const [coHostInvitations, setCoHostInvitations] = useState<Invitation[]>([]);

  const fetchInvitations = async () => {
    setLoading(true);
    const URL = `${INVITATION_URL}/me`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const invitationData = res.data.invitations;
      setCoHostInvitations(
        invitationData.filter((invitation: Invitation) => invitation.organizationID && invitation.organizationID != '')
      );
      setLoading(false);
    } else {
      if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
      else Toaster.error(SERVER_ERROR, 'error_toaster');
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);
  return (
    <>
      <div className="fixed top-10 max-lg:top-0 w-1/2 max-lg:w-screen h-[90%] max-lg:h-screen backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col justify-between rounded-lg px-12 py-8 gap-8 max-lg:gap-4 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 translate-x-1/2 shadow-2xl animate-fade_third z-50">
        <div className="font-semibold text-5xl text-gray-800 mt-8">Co-host Invitations</div>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="w-full h-full flex flex-col gap-6 p-2">
              {coHostInvitations.length > 0 ? (
                <div className="w-[720px] max-md:w-full max-md:px-4 mx-auto flex flex-col gap-4">
                  {coHostInvitations.map(invitation => {
                    return (
                      <EventInvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        setInvitations={setCoHostInvitations}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-xl w-full items-center max-md:text-lg font-medium text-center">
                  <span className="text-2xl font-semibold">Ah! </span> looks like you&apos;re short on invitations.
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen max-lg:w-[105vw] max-lg:h-[105vh] fixed top-0 left-0 animate-fade_third z-20"
      ></div>
    </>
  );
};

export default ViewInvitations;