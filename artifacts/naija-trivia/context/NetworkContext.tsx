import NetInfo from "@react-native-community/netinfo";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface NetworkContextValue {
  /** True when the device has a working internet connection. */
  isOnline: boolean;
  /** Briefly true (≈4 s) right after the connection is restored. */
  justReconnected: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  justReconnected: false,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const prevOnline = useRef(true);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Seed with the current state before the subscription fires.
    NetInfo.fetch().then((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      prevOnline.current = online;
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;

      if (online && !prevOnline.current) {
        // Transition: offline → online
        setJustReconnected(true);
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(
          () => setJustReconnected(false),
          4000
        );
      }

      prevOnline.current = online;
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, justReconnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
