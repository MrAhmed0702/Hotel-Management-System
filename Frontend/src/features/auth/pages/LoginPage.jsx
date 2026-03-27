import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginSuccess } from '../authSlice';
import { authApi } from '../api/authApi';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: {errors, isSubmitting}} = useForm();

  const onSubmit = async (data) => {
    try {
      const { user, token } = await authApi.login(data);

      dispatch(loginSuccess({ user, token }));

      navigate("/");

    } catch (error) {
      console.error("Login failed:", error);
    }
  }


  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type='email'
          placeholder='email'
          {...register("email", {
            required: {
              value: true,
              message: "Email is required"
            },
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}

        <input
          type='password'
          placeholder='password'
          {...register("password", {
            required: {
              value: true,
              message: "Password is required"
            },
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long"
            }
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}

        <button type='submit' disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  )
}

export default LoginPage