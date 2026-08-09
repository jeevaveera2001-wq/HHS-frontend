import {
  useEffect,
  useRef,
} from "react";

import {
  connectPropertySocket,
} from "../services/socketService";

/* =====================================
   Property realtime hook
===================================== */

function usePropertyRealtime(
  onPropertyChanged
) {
  const callbackRef =
    useRef(
      onPropertyChanged
    );

  useEffect(() => {
    callbackRef.current =
      onPropertyChanged;
  }, [onPropertyChanged]);

  useEffect(() => {
    const socket =
      connectPropertySocket();

    const handlePropertyChange =
      (eventData) => {
        callbackRef.current?.(
          eventData
        );
      };

    socket.on(
      "property:changed",
      handlePropertyChange
    );

    return () => {
      socket.off(
        "property:changed",
        handlePropertyChange
      );
    };
  }, []);
}

export default usePropertyRealtime;