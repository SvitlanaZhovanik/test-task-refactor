import React, {useCallback, useContext, useEffect, useState} from "react";
import { useRouter } from "next/router";

interface RemoteConfigContext {
  abTests: Record<string, string>
  featureFlags: Record<string, string>
  reloadConfig: () => void;
  isRemoteConfigLoading: boolean
}

const defaultContext: RemoteConfigContext = {
  abTests: {},
  featureFlags: {},
  reloadConfig: () => {},
  isRemoteConfigLoading: true
}


export const RemoteConfigContext = React.createContext(defaultContext);
export const useRemoteConfig = () => {
  return useContext(RemoteConfigContext);
}

interface IRemoteConfigProvider {
  children: React.ReactNode
}

const filterObjByKeyPrefix = (obj: Record<string, any>, prefix: string): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (key.startsWith(prefix)) {
      result[key] = obj[key];
    }
  }

  return result;
}

export default function RemoteConfigProvider({ children }: IRemoteConfigProvider) {
  const router = useRouter()
  const [abTests, setAbTests] = useState(defaultContext.abTests);
  const [featureFlags, setFeatureFlags] = useState(defaultContext.featureFlags);
  const [isRemoteConfigLoading, setIsRemoteConfigLoading] = React.useState(defaultContext.isRemoteConfigLoading)

  const getRemoteConfig = useCallback ((): Promise<Record<string, string>> => {
      return new Promise((res) => res({}))
  }, [])

  const reloadConfig = React.useCallback(() => {
    setIsRemoteConfigLoading(true)
    getRemoteConfig().then((res) => {
      const abTests = filterObjByKeyPrefix(res, "ab-");
      setAbTests(abTests);

      const featureFlags = filterObjByKeyPrefix(res, "ff-");
      setFeatureFlags(featureFlags);
    });
  }, [getRemoteConfig])

  const onRouteChange = useCallback(() => {
    reloadConfig();
  }, [reloadConfig])

  useEffect(() => {
    router.events.on('routeChangeStart', onRouteChange)

    return () => {
      router.events.off('routeChangeStart', onRouteChange)
    }
  }, [onRouteChange, router.events])

  useEffect(() => {
    reloadConfig();
  }, [reloadConfig])

  return (
    <RemoteConfigContext.Provider value={{ abTests, featureFlags, reloadConfig, isRemoteConfigLoading }}>
      {children}
    </RemoteConfigContext.Provider>
  )
}
