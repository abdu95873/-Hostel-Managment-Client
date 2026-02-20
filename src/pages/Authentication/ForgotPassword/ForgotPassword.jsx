import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

const ForgotPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        // 👉 Here you will call your API
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="card w-full max-w-sm shadow-xl bg-base-100">

                {/* Header */}
                <div className="px-6 pt-6 space-y-1">
                    <h1 className="text-3xl font-bold">Forgot Password</h1>
                    <p className="text-gray-600">
                        Enter your email address and we’ll send you a reset link.
                    </p>
                </div>

                {/* Form */}
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div>
                            <label className="label font-medium">Email</label>
                            <input
                                type="email"
                                className="input input-bordered w-full"
                                placeholder="Enter Email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Invalid email format",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <button className="btn  w-full mt-2">
                            Send
                        </button>

                        {/* Bottom Login Link */}
                        <div className="flex items-center justify-center gap-1 text-sm opacity-80 mt-2">
                            <span>Remember your password?</span>
                            <Link to="/login" className="link link-hover text-lime-700">Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
