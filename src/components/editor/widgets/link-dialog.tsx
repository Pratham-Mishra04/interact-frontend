import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type LinkDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setURL: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
};

const LinkDialog = ({ open, setOpen, setURL, onSubmit }: LinkDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl text-left font-bold">Add Link</DialogTitle>
          <DialogDescription className="text-md text-left">Enter the link you want to embed.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="text"
            placeholder="Enter URL"
            className="w-full p-2 border-2 border-gray-300 dark:border-neutral-700 rounded-md ring-none outline-none"
            onChange={e => setURL(e.target.value)}
          />
          <DialogFooter className="mt-2">
            <Button type="submit" variant="outline">
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkDialog;
