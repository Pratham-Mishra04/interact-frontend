import { Opening } from '@/types';
interface Props {
  setClickedOnOpening: React.Dispatch<React.SetStateAction<boolean>>;
  opening: Opening;
  setClickedOpening: React.Dispatch<React.SetStateAction<Opening>>;
}

const OpeningCard = (props: Props) => {
  return (
    <div
      className="flex text-wrap rounded-2xl bg-black text-white text-2xl h-3/6 w-fit"
      onClick={() => {
        props.setClickedOnOpening(true);
        props.setClickedOpening(props.opening);
      }}
    >
      <div>Active:{props.opening.active.toString()}</div>
      <div>Title:{props.opening.title}</div>
      <div>Description{props.opening.description}</div>
      <div className="flex flex-row w-full">
        Tags
        {props.opening?.tags ? props.opening.tags.map((tag, index) => <div key={index}>{tag}</div>) : ''}
      </div>
    </div>
  );
};
export default OpeningCard;
