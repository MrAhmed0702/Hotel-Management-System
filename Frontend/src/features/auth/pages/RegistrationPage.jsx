import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { registration } from "../authSlice";
import reg from "../../../assets/AuthImages/reg.png";
import toast from "react-hot-toast";

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
      const formData = new FormData();

      // append all fields
      Object.keys(data).forEach((key) => {
        if (key === "photo") {
          if (data.photo?.[0]) {
            formData.append("photo", data.photo[0]);
          }
        } else {
          formData.append(key, data[key]);
        }
      });

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
    <div className="w-full h-screen flex bg-white">
      {/* LEFT SIDE */}
      <div className="w-1/2 h-full relative hidden lg:block">
        {/* LOGO (GRADIENT FIXED) */}
        <div className="absolute inset-5 z-20">
          <h1
            className="inline-block text-2xl font-semibold tracking-wide 
          bg-gradient-to-r from-[#E6D3A3] via-[#D4AF37] to-[#C5A059] 
          bg-clip-text text-transparent drop-shadow-sm"
          >
            LuxeStay
          </h1>
        </div>

        {/* IMAGE */}
        <img
          src={reg}
          alt="Luxury Hotel"
          className="w-full h-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center text-white px-10">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-semibold leading-tight">
              Orchestrate <br />
              <span className="text-[#C5A059]">Excellence</span> in Every Stay
            </h1>
            <p className="mt-4 text-sm text-gray-200">
              Join the network of elite properties using LuxeStay to transform
              guest experiences into lasting memories.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center bg-white">
        {/* GRADIENT BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F1EA]/70 via-[#FBF9FB]/40 to-transparent pointer-events-none" />

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 right-10 flex items-center gap-1 text-gray-600 hover:text-[#C5A059] transition"
        >
          <MoveLeft size={18} />
          <span className="text-sm">Back to website</span>
        </button>

        {/* FORM */}
        <div className="relative w-full max-w-md p-8">
          {/* HEADER */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#1A2B44]">
              Create your account
            </h2>
            <p className="text-sm text-gray-500">
              Start your journey with LuxeStay
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {watch("photo")?.[0] ? (
                  <img
                    src={URL.createObjectURL(watch("photo")[0])}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500">Photo</span>
                )}
              </div>

              {/* Upload Button */}
              <label className="cursor-pointer text-sm text-[#C5A059] hover:underline">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  {...register("photo")}
                  className="hidden"
                />
              </label>
            </div>

            {/* NAME */}
            <div className="grid grid-cols-2 gap-3">
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

            <Input
              icon={Mail}
              placeholder="Email"
              register={register("email", {
                required: "Required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
              })}
              error={errors.email}
            />

            <Input
              icon={Phone}
              placeholder="Phone Number"
              register={register("phoneNumber", {
                required: "Required",
                pattern: { value: /^[0-9]{10}$/, message: "Invalid number" },
              })}
              error={errors.phoneNumber}
            />

            {/* DOB + GENDER */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                icon={Calendar}
                register={register("dateOfBirth")}
              />
              <select {...register("gender")} className="input">
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

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

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1A2B44] text-white py-2 rounded-md 
              hover:bg-[#142033] transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Register Account →"}
            </button>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#C5A059] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;

/* 🔥 REUSABLE INPUT */
const Input = ({ icon: Icon, type = "text", placeholder, register, error }) => (
  <div className="relative">
    {Icon && <Icon className="input-icon" size={18} />}

    <input
      type={type}
      placeholder={placeholder}
      {...register}
      className={`input pl-10 ${error ? "border-red-500 focus:ring-red-500" : ""}`}
    />

    {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
  </div>
);
