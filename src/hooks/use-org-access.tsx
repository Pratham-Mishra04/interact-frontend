import { useSelector } from 'react-redux';
import checkOrgAccess, { checkOrgAccessByOrgUserID } from '@/utils/funcs/access';
import { userSelector } from '@/slices/userSlice';
import { orgSelector } from '@/slices/orgSlice';

export const useOrgAccess = (role: string, id?: string, isOrgUserID = false) => {
  const user = useSelector(userSelector);
  const organization = useSelector(orgSelector);

  return isOrgUserID && id
    ? checkOrgAccessByOrgUserID({ user, organization }, role, id)
    : checkOrgAccess({ user, organization }, role, id);
};
