import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import ForgotPassword from '../pages/Authentication/ForgotPassword/ForgotPassword';
import EnterCode from '../pages/Authentication/ForgotPassword/EnterCode';
import ResetPassword from "../pages/Authentication/ForgotPassword/ResetPassword";
import Error404 from "../pages/ErrorSection/Error404";
import PrivetRoute from "../routes/PrivetRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome";
import Users from "../pages/Dashboard/Users/Users";
import Accounting from "../pages/Dashboard/Accounting/Accounting";
import Rooms from "../pages/Dashboard/Rooms/Rooms";
import Payments from "../pages/Dashboard/Payments/Payments";
import Branches from "../pages/Dashboard/Branches/Branches";
import Buildings from "../pages/Dashboard/Buildings/Buildings";
import Floors from "../pages/Dashboard/Floors/Floors";
import Beds from "../pages/Dashboard/Bed/Bed";
import AssignRoom from "../pages/Dashboard/AssignRoom/AssignRoom";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        Component: Home,
      },



    ]
  },
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <Error404 />, // <-- Also handle errors in auth layout
    children: [
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'register',
        Component: Register,
      },
      {
        path: 'forgotPassword',
        Component: ForgotPassword,
      },
      {
        path: 'forgotPassword/enterCode',
        Component: EnterCode,
      },
      {
        path: 'forgotPassword/resetPassword',
        Component: ResetPassword,
      },
    ]
  },
  {

    path: '/dashboard',
    // element: <PrivetRoute></PrivetRoute>,
    Component: DashboardLayout,
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        Component: DashboardHome,

      },
     
       { 
        path: 'users', 
        Component: Users 
      },
    { 
      path: 'payments', 
      Component: Payments 
    },
    { 
      path: 'accounting', 
      Component: Accounting 
    },
    
    
     { 
      path: 'branches', 
      Component: Branches 
    },
    { 
      path: 'buildings', 
      Component: Buildings 
    },
    { 
      path: 'floors', 
      Component: Floors 
    },
    { 
      path: 'rooms', 
      Component: Rooms 
    },
    { 
      path: 'beds', 
      Component: Beds 
    },
    { 
      path: 'assignRoom', 
      Component: AssignRoom 
    },

    ]

  },

  // Optional: catch all unmatched routes outside layouts
  {
    path: "*",
    Component: Error404,
  },
]);

export default router;
