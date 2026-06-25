import { Outlet } from "react-router-dom";

import { useAuthRehydrate } from "../hooks/useAuthRehydrate";
import FullScreenLoader from "../components/ui/FullScreenLoader";

export default function AppInitializer() {
  const { isLoading } = useAuthRehydrate();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return <Outlet />;
}