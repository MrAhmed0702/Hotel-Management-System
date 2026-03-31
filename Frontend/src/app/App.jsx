import { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuthRehydrate } from "../hooks/useAuthRehydrate";
import FullScreenLoader from "../components/ui/FullScreenLoader";

function App() {
  const location = useLocation();
  const { isLoading } = useAuthRehydrate();
  const hideNavbar = location.pathname.startsWith("/login") || location.pathname.startsWith("/register");
  const showNavbar = !hideNavbar;
  
  if (isLoading) return <FullScreenLoader />;
  return (
    <>
      {showNavbar && <Navbar />}
      <Suspense fallback={<FullScreenLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
}

export default App;