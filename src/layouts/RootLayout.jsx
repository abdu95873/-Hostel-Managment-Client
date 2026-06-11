import { Outlet } from "react-router";
import Navbar from "../pages/Home/Shared/Navbar/Navbar";
import Footer from "../pages/Home/Shared/Footer/Footer";

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
