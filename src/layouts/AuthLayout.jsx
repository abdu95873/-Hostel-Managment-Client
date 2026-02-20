import React from 'react';
import { Link, Outlet } from 'react-router';
import ProFastLogo from '../pages/Home/Shared/Logo/ProFastLogo';

const AuthLayout = () => {
    return (
        <div>
            {/* Logo */}
            <div >
                <Link to="/">
                    <ProFastLogo />
                </Link>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 h-[755px]">

                {/* LEFT SIDE */}
                <div className="flex">
                    <Outlet />
                </div>

                {/* RIGHT SIDE - hidden on small screens */}
                <div className="hidden sm:flex bg-lime-100 items-center justify-center">
                    <img src="/src/assets/authImage.png" alt="" />
                </div>
            </div>
        </div>

    );
};

export default AuthLayout;
