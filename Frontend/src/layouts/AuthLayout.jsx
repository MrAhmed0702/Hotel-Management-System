import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import FullScreenLoader from "../components/ui/FullScreenLoader";

export default function AuthLayout() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Outlet />
    </Suspense>
  );
}