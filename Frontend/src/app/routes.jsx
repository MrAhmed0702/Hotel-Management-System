import { Route, Routes } from "react-router-dom"

const Home = () => (
  <h1 className="text-3xl font-bold text-blue-500">
    Tailwind Working 🚀
  </h1>
);

const Login = () => <h1>Login Page</h1>;
const Register = () => <h1>Register Page</h1>;
const NotFound = () => <h1>404 Not Found</h1>;

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes;