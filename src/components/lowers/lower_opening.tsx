import React, { useState } from 'react';
import { Opening } from '@/types';
import { useSelector } from 'react-redux';
import { userSelector } from '@/slices/userSlice';
// import clickedOnSharePost from './clickedOnShare_project';
import { Gear, Export } from '@phosphor-icons/react';
import OpeningBookmarkIcon from './opening_bookmark';
import Report from '../common/report';
import { WarningCircle } from '@phosphor-icons/react';
import SignUp from '../common/signup_box';
import { checkParticularOrgAccess } from '@/utils/funcs/access';
import { ORG_MANAGER } from '@/config/constants';
import Share from '@/sections/lowers/share';
import OpeningCard from '../cards/opening';
import TooltipIcon from '../common/tooltip_icon';

interface Props {
  opening: Opening;
  org?: boolean;
}

const LowerOpening = ({ opening, org = false }: Props) => {
  const [clickedOnShare, setClickedOnShare] = useState(false);
  const [clickedOnReport, setClickedOnReport] = useState(false);
  const [noUserClick, setNoUserClick] = useState(false);

  const user = useSelector(userSelector);
  return (
    <>
      {noUserClick && <SignUp setShow={setNoUserClick} />}
      {clickedOnShare && (
        <Share
          itemID={opening.id}
          itemType="opening"
          setShow={setClickedOnShare}
          clipboardURL={`openings?oid=${opening.id}&action=external`}
          item={<OpeningCard opening={opening} />}
        />
      )}
      {clickedOnReport && <Report openingID={opening.id} setShow={setClickedOnReport} />}

      <div className="flex gap-4 items-center">
        {org
          ? checkParticularOrgAccess(ORG_MANAGER, opening.organization) && (
              <TooltipIcon
                label="Edit Opening"
                icon={
                  <Gear
                    className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
                    onClick={() => {
                      window.location.assign(
                        `/organisations?oid=${opening.organizationID}&redirect_url=openings&action=edit`
                      );
                    }}
                    size={32}
                    weight="light"
                  />
                }
                excludeHoverEffect
              />
            )
          : user.id == opening?.userID ||
            (user.editorProjects.includes(opening.projectID) && (
              <TooltipIcon
                label="Edit Opening"
                icon={
                  <Gear
                    className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
                    onClick={() => {
                      window.location.assign(
                        `/workspace/manage/${opening.project?.slug}?action=edit&oid=${opening.id}`
                      );
                    }}
                    size={32}
                    weight="light"
                  />
                }
                excludeHoverEffect
              />
            ))}
        <OpeningBookmarkIcon opening={opening} />
        <TooltipIcon
          label="Share"
          icon={
            <Export
              onClick={() => {
                if (user.id == '') setNoUserClick(true);
                else setClickedOnShare(true);
              }}
              className="cursor-pointer max-md:w-[32px] max-md:h-[32px]"
              size={32}
              weight="duotone"
            />
          }
          excludeHoverEffect
        />
        <TooltipIcon
          label="Report"
          icon={
            <WarningCircle
              onClick={() => {
                if (user.id == '') setNoUserClick(true);
                else setClickedOnReport(true);
              }}
              className="cursor-pointer max-md:w-6 max-md:h-6"
              size={32}
            />
          }
          excludeHoverEffect
        />
      </div>
    </>
  );
};

export default LowerOpening;
