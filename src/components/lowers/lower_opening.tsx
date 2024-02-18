import React, { useState } from 'react';
import { Opening } from '@/types';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { userIDSelector, userSelector } from '@/slices/userSlice';
// import clickedOnSharePost from './clickedOnShare_project';
import Gear from '@phosphor-icons/react/dist/icons/Gear';
import Export from '@phosphor-icons/react/dist/icons/Export';
import ShareOpening from '@/sections/lowers/share_opening';
import OpeningBookmarkIcon from './opening_bookmark';
import Report from '../common/report';
import { WarningCircle } from '@phosphor-icons/react';
import SignUp from '../common/signup_box';
import { checkParticularOrgAccess } from '@/utils/funcs/check_org_access';
import { ORG_MANAGER } from '@/config/constants';

interface Props {
  opening: Opening;
  org?: boolean;
}

const LowerOpening = ({ opening, org = false }: Props) => {
  const [clickedOnShare, setClickedOnShare] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);
  const [noUserClick, setNoUserClick] = useState(false);

  const user = useSelector(userSelector);

  const router = useRouter();

  const userID = useSelector(userIDSelector) || '';

  return (
    <>
      {noUserClick ? <SignUp setShow={setNoUserClick} /> : <></>}
      {clickedOnShare ? <ShareOpening setShow={setClickedOnShare} opening={opening} org={org} /> : <></>}
      {clickedOnReport ? <Report openingID={opening.id} setShow={setClickedOnReport} /> : <></>}

      <div className="flex gap-4 items-center">
        {org
          ? checkParticularOrgAccess(ORG_MANAGER, opening.organization) && (
              <Gear
                className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
                onClick={() => {
                  //TODO use window.location
                  router.push(`/organisations?redirect_url=openings?action=edit&oid=${opening.id}`);
                }}
                size={32}
                weight="light"
              />
            )
          : user.id == opening?.userID ||
            (user.editorProjects.includes(opening.projectID) && (
              <Gear
                className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
                onClick={() => {
                  router.push(`/workspace/manage/${opening.project?.slug}?action=edit&oid=${opening.id}`);
                }}
                size={32}
                weight="light"
              />
            ))}
        <Export
          onClick={() => {
            if (userID == '') setNoUserClick(true);
            else setClickedOnShare(true);
          }}
          className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
          size={32}
          weight="duotone"
        />
        <OpeningBookmarkIcon opening={opening} />
        <WarningCircle
          onClick={() => {
            if (userID == '') setNoUserClick(true);
            else setClickedOnReport(true);
          }}
          className="cursor-pointer max-md:w-6 max-md:h-6"
          size={32}
        />
      </div>
    </>
  );
};

export default LowerOpening;
