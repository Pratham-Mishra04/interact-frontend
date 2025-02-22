import { RazorpayPaymentButton } from '@/components/buttons/rzp_btn';
import Sidebar from '@/components/common/sidebar';
import NonOrgOnlyAndProtect from '@/utils/wrappers/non_org_only';
import BaseWrapper from '@/wrappers/base';
import MainWrapper from '@/wrappers/main';

const Credits = () => {
  return (
    <BaseWrapper title="Credits">
      <Sidebar index={9} />
      <MainWrapper>
        <div className="w-full max-lg:w-full mx-auto flex flex-col gap-8 px-8 max-md:px-4 py-6 font-primary relative transition-ease-out-500">
          <div className="w-fit text-5xl max-md:text-3xl font-extrabold pl-2">Credits</div>
          <div className="w-full grid grid-cols-3 gap-8">
            <CreditCard title="Pro" description="For Project Finders" amount={100} credits={10} planID="plan_a" />
            <CreditCard title="Premium" description="For Project Owners" amount={200} credits={20} planID="plan_abc" />
          </div>
        </div>
      </MainWrapper>
    </BaseWrapper>
  );
};

interface Props {
  title: string;
  description: string;
  amount: number;
  credits: number;
  planID: string;
}

const CreditCard = ({ title, description, amount, credits, planID }: Props) => {
  return (
    <div className="flex overflow-clip flex-col gap-6 bg-white rounded-3xl p-6 hover:shadow-lg transition-ease-500">
      <div className="grid items-center justify-center w-full grid-cols-1 text-left">
        <div>
          <h2 className="text-lg font-medium tracking-tighter text-primary_black lg:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
        <div className="mt-6">
          <p>
            <span className="text-5xl font-medium tracking-tight text-black">₹{amount}</span>
            <span className="text-base font-medium text-gray-500"> for 1 month </span>
          </p>
        </div>
      </div>

      <div className="w-full flex-center">
        <RazorpayPaymentButton title="Buy Now" planID={planID} amount={amount} credits={credits} />
      </div>
    </div>
  );
};

export default NonOrgOnlyAndProtect(Credits);
