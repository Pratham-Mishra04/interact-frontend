import { Id, Slide, ToastOptions, UpdateOptions, toast } from 'react-toastify';

class Toaster {
  //TODO add different ids to toasters
  static toastSettings: ToastOptions = {
    position: 'top-center',
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Slide,
  };

  static success(message: string, toastId: string = 'default'): Id {
    return toast.success(message, { ...this.toastSettings, toastId });
  }

  static error(message: string, toastId: string = 'default'): Id {
    return toast.error(message, { ...this.toastSettings, toastId });
  }

  static startLoad(message: string = 'Loading...', toastId: string = 'default'): Id {
    return toast.loading(message, { ...this.toastSettings, toastId });
  }

  static stopLoad(loader: Id, message: string, res: number): void {
    const settings: UpdateOptions = { ...this.toastSettings };
    settings.render = message;
    settings.type = res === 1 ? 'success' : 'error';
    settings.isLoading = false;
    toast.update(loader, settings);
  }
}

export const messageToastSettings: ToastOptions = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

export default Toaster;
