import { useEffect, useState } from 'react';
import io,{Socket} from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState<Socket|null>(null);

  useEffect(() => {
    const socketInstance = io(`${process.env.REACT_APP_BACKEND_PATH}`);
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;