import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect, useState } from "react";

enum UserStatus {
  ANONYMOUS = "ANONYMOUS",
  REGISTERED = "REGISTERED",
  DELETED = "DELETED",
  BLACKLISTED = "BLACKLISTED",
}
export interface User {
  id: string;
  email: string | null;
  status: UserStatus;
  subscription: null;
  ab_test: string[];
  hadSubscription: boolean;
}

type UserContextType = {
  isLoading: boolean;
  user: User | null;
};

const defaultContext: UserContextType = {
  isLoading: true,
  user: {
    id: "kjsdnckjsbdcjbjsk",
    email: "shjdbjksb@jkswdn.sdkj",
    status: UserStatus.REGISTERED,
    subscription: null,
    hadSubscription: false,
    ab_test: [""],
  },
};

export const UserContext = React.createContext(defaultContext);
export const useUser = () => useContext(UserContext);
interface IUserProvider {
  children: React.ReactNode;
}
export default function UserProvider({ children }: IUserProvider) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const userLocaleRef = React.useRef("en");

  const onRouteChange = useCallback(() => {
    setIsLoading(true);

    setUser({
      id: "kjsdnckjsbdcjbjsk",
      email: "shjdbjksb@jkswdn.sdkj",
      status: UserStatus.REGISTERED,
      subscription: null,
      hadSubscription: false,
      ab_test: [""],
    });
  }, [setIsLoading]);

  useEffect(() => {
    router.events.on("routeChangeStart", onRouteChange);

    if (router.locale) {
      userLocaleRef.current = router.locale;
    }

    return () => {
      router.events.off("routeChangeStart", onRouteChange);
    };
  }, [onRouteChange, router.events]);

  useEffect(() => {
    onRouteChange();
  }, [onRouteChange]);

  const contextValue = {
    isLoading,
    user,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
