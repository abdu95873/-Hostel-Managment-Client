import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import SocialLogin from "../SocialLogin/SocialLogin";
import useAuth from "../../../hooks/useAuth";
import { useLocation } from "react-router";


const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate(); // ✅ get navigate hook
    const { signInUser } = useAuth();
    const location = useLocation(); // <-- Added this

    const from = location.state?.from?.pathname || '/';


    const onSubmit = (data) => {
        console.log("Login Data:", data);
        // 👉 Call your login API here
        signInUser(data.email, data.password)
            .then(result => {
                console.log(result.user)
                navigate(from, { replace: true });
            })
            .catch(error => {
                console.log(error)
            })

    };

    return (
        <div className="flex w-full h-screen items-center justify-center bg-base-200 px-4">
            <div className="card max-w-sm w-full shadow-2xl bg-base-100">
                <div className="px-6 pt-6">
                    <h1 className="text-3xl mb-1">Welcome Back</h1>
                    <p className="text-gray-600">Login with ProFast</p>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="label font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input input-bordered w-full"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label font-medium">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input input-bordered w-full"
                                {...register("password", { required: "Password is required" })}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="mt-2 text-right">
                            <Link to="/forgotPassword" className="link link-hover opacity-70">Forgot password?</Link>
                        </div>

                        {/* Login Button */}
                        <button type="submit" className="btn  w-full">
                            Login
                        </button>

                        {/* Register Link */}
                        <div className="flex items-center gap-2 opacity-70 ">
                            <span>Don't have any Account?</span>
                            <Link to="/register" className="link link-hover ">Register</Link>
                        </div>

                        {/* Or */}
                        <div>
                            <h1 className="text-center opacity-50">Or</h1>
                        </div>
                        <div>
                            <SocialLogin></SocialLogin>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
