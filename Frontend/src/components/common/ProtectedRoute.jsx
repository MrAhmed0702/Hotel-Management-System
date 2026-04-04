import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import FullScreenLoader from "../ui/FullScreenLoader";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if(isLoading){
        return <FullScreenLoader />;
    }

    if(!isAuthenticated){
        return <Navigate to="/login"  replace/>;
    }

    return <Outlet />;
};

export default ProtectedRoute;