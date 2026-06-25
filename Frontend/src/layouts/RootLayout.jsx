import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import FullScreenLoader from "../components/ui/FullScreenLoader";

export default function RootLayout() {
  return (
    <>
      <Navbar />

      <Suspense fallback={<FullScreenLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
}