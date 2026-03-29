import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { registration } from "../authSlice";
import reg from "../../../assets/AuthImages/reg.png";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { User, Mail, Phone, Lock, Calendar, MoveLeft } from "lucide-react";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      const formData = new FormData();

      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("dateOfBirth", data.dateOfBirth);
      formData.append("gender", data.gender);
      formData.append("password", data.password);

      if (data.photo?.[0]) {
        formData.append("profilePicture", data.photo[0]);
      }

      const res = await authApi.register(formData);

      dispatch(registration({ user: res.data.data }));

      toast.success("Registration successful 🚀");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Registration failed ❌");
    }
  };

  return (
    <div className="w-full min-h-screen flex overflow-y-auto bg-gradient-to-br from-[#F8F6F2] via-white to-[#F3EFE7]">
      {/* LEFT */}
      <div className="w-1/2 relative hidden lg:block">
        <div className="absolute inset-5 z-20">
          <h1 className="text-2xl font-semibold tracking-wide bg-gradient-to-r from-[#E6D3A3] via-[#D4AF37] to-[#C5A059] bg-clip-text text-transparent">
            LuxeStay
          </h1>
        </div>

        <img src={reg} className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white px-10">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-semibold">
              Orchestrate <br />
              <span className="text-[#C5A059]">Excellence</span>
            </h1>
            <p className="mt-4 text-sm text-gray-200">
              Transform guest experiences into lasting memories.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-12">
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 right-10 flex items-center gap-1 text-gray-600 hover:text-[#C5A059]"
        >
          <MoveLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border"
        >
          <div className="h-1 w-16 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] mb-4" />

          <h2 className="text-3xl font-bold text-[#1A2B44]">Create Account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Start your LuxeStay journey
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                {watch("photo")?.[0] ? (
                  <img
                    src={URL.createObjectURL(watch("photo")[0])}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    Photo
                  </div>
                )}
              </div>

              <label className="cursor-pointer text-sm text-[#C5A059]">
                Upload Photo
                <input type="file" {...register("photo")} hidden />
              </label>
            </div>

            {/* NAME */}
            <div className="grid grid-cols-2 gap-3 items-start">
              <Input
                icon={User}
                placeholder="First Name"
                register={register("firstName", { required: "Required" })}
                error={errors.firstName}
              />
              <Input
                icon={User}
                placeholder="Last Name"
                register={register("lastName", { required: "Required" })}
                error={errors.lastName}
              />
            </div>

            {/* EMAIL */}
            <Input
              icon={Mail}
              placeholder="Email"
              register={register("email", { required: "Required" })}
              error={errors.email}
            />

            {/* PHONE */}
            <Input
              icon={Phone}
              placeholder="Phone Number"
              register={register("phoneNumber", { required: "Required" })}
              error={errors.phoneNumber}
            />

            {/* DOB + GENDER */}
            <div className="grid grid-cols-2 gap-3 items-start">
              <Input
                type="date"
                icon={Calendar}
                register={register("dateOfBirth", { required: "Required" })}
                error={errors.dateOfBirth}
              />

              {/* SELECT FIXED */}
              <div>
                <div className="h-[42px] relative">
                  <select
                    {...register("gender", { required: "Required" })}
                    className={`w-full h-full border rounded-lg px-3 outline-none
                    ${errors.gender ? "border-red-500" : "border-gray-400"}`}
                  >
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="min-h-[18px] mt-1">
                  {errors.gender && (
                    <p className="text-xs text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PASSWORD */}
            <Input
              type="password"
              icon={Lock}
              placeholder="Password"
              register={register("password", { required: "Required" })}
              error={errors.password}
            />

            {/* CONFIRM */}
            <Input
              type="password"
              icon={Lock}
              placeholder="Confirm Password"
              register={register("confirmPassword", {
                validate: (val) =>
                  val === watch("password") || "Passwords do not match",
              })}
              error={errors.confirmPassword}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1A2B44] text-white py-3 rounded-lg"
            >
                {isSubmitting ? "Registering..." : "Register →"}
            </button>

            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#C5A059]">
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationPage;

/* 🔥 PERFECT INPUT */
const Input = ({ icon: Icon, type = "text", placeholder, register, error }) => (
  <div>
    <div className="relative h-[42px]">
      {Icon && (
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          size={18}
        />
      )}

      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`w-full h-full border rounded-lg pl-10 pr-3 outline-none
        ${error ? "border-red-500" : "border-gray-400 focus:border-[#C5A059]"}`}
      />
    </div>

    {/* RESERVED SPACE */}
    <div className="min-h-[18px] mt-1">
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  </div>
);
