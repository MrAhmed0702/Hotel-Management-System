import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "../components/common/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";

const Home = () => <h1>Home</h1>;
const Register = () => <h1>Register Page</h1>;
const NotFound = () => <h1>404 Not Found</h1>;

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes;