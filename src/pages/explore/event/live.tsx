import Meeting from '@/screens/organisation/meeting';
import Toaster from '@/utils/toaster';
import { DyteProvider, useDyteClient } from '@dytesdk/react-web-core';
import { useEffect, useState } from 'react';

export default function App() {
  const [meeting, initMeeting] = useDyteClient();
  const [eventID, setEventID] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const id = urlParams.get('id');

    if (!token || token == '' || !id || id == '') {
      Toaster.error('Invalid session');
      return;
    }
    setEventID(id);

    initMeeting({
      authToken: token,
      defaults: {
        audio: false,
        video: false,
      },
    });
  }, []);

  return (
    <DyteProvider value={meeting}>
      <Meeting callbackURL={`events/${eventID}`} />
    </DyteProvider>
  );
}
