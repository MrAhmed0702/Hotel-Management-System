import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { loginSuccess } from "../authSlice";
import login from "../../../assets/AuthImages/login.png";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { Mail, Lock, MoveLeft } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm({
    shouldFocusError: true,
    shouldUnregister: false,
  });

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);

      dispatch(
        loginSuccess({
          user: res.data,
          token: res.token,
        })
      );

      toast.success("Login successful 🚀");
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "Invalid email or password";
      // highlight inputs
      setError("email", { type: "manual" });
      setError("password", { type: "manual" });

      // global error
      setError("root", {
        type: "manual",
        message,
      });

      toast.error(message);
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-gradient-to-br from-[#F8F6F2] via-white to-[#F3EFE7]">

      {/* LEFT SIDE */}
      <div className="w-1/2 relative hidden lg:block">
        <div className="absolute inset-5 z-20">
          <h1 className="text-2xl font-semibold tracking-wide bg-gradient-to-r from-[#E6D3A3] via-[#D4AF37] to-[#C5A059] bg-clip-text text-transparent">
            LuxeStay
          </h1>
        </div>

        <img src={login} className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 flex items-center justify-center text-white px-10">
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold leading-tight">
              Experience <br />
              Orchestrated <br />
              <span className="text-[#C5A059]">Excellence.</span>
            </h1>
            <p className="mt-4 text-sm text-gray-200">
              Elevate hospitality operations and create unforgettable guest journeys.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-12">

        <button
          onClick={() => navigate("/")}
          className="absolute top-8 right-10 flex items-center gap-1 text-gray-600 hover:text-[#C5A059]"
        >
          <MoveLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-200"
        >
          <div className="h-1 w-16 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] rounded-full mb-4" />

          <h2 className="text-3xl font-bold text-[#1A2B44] mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Start your journey with LuxeStay
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <Input
              icon={Mail}
              placeholder="Email"
              register={register("email", {
                required: "Required",
                pattern: { value: /^\S+@\S+$/, message: "Invalid email" },
              })}
              error={errors.email}
            />

            <Input
              type="password"
              icon={Lock}
              placeholder="Password"
              register={register("password", {
                required: "Required",
                minLength: { value: 6, message: "Min 6 chars" },
              })}
              error={errors.password}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1A2B44] text-white py-3 rounded-lg font-medium hover:bg-[#142033]"
            >
              {isSubmitting ? "Logging in..." : "Login →"}
            </button>

            <p className="text-sm text-center text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#C5A059] hover:underline">
                Register
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;


/* INPUT COMPONENT */
const Input = ({ icon: Icon, type = "text", placeholder, register, error }) => (
  <div>
    <div
      className={`flex items-center h-[44px] border rounded-lg px-3 bg-white
      ${
        error
          ? "border-red-500 focus-within:ring-2 focus-within:ring-red-400"
          : "border-gray-400 focus-within:ring-2 focus-within:ring-[#C5A059]/40"
      }`}
    >
      {Icon && <Icon className="text-gray-500 mr-2" size={18} />}

      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="w-full h-full outline-none bg-transparent text-sm"
      />
    </div>

    <div className="min-h-[18px] mt-1">
      {error && (
        <p className="text-xs text-red-500">{error.message}</p>
      )}
    </div>
  </div>
);