"use client";

import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { getAuthFromStorage } from "@/lib/authStorage";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReactQueryProvider>
          <InitAuth>{children}</InitAuth>
        </ReactQueryProvider>
      </PersistGate>
    </Provider>
  );
}

const InitAuth = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuthFromStorage();

    if (auth) {
      dispatch(setUser(auth));
    }
  }, [dispatch]);

  return <>{children}</>;
};
