import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// const StatCard = ({ title, value, icon: Icon, gradient, loading }) => {
//   return (
//     <div
//       className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300`}
//     >
//       <div className="flex items-center justify-between">
//         <div className="flex-1">
//           <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
//           <h3 className="text-white text-4xl font-bold">
//             {loading ? (
//               <span className="loading loading-spinner loading-sm"></span>
//             ) : (
//               value
//             )}
//           </h3>
//         </div>
//         <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
//           <Icon className="text-white" size={32} />
//         </div>
//       </div>
//     </div>
//   );
// };

// const TableCard = ({ title, icon: Icon, columns, data, loading, gradient }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//       <div
//         className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center gap-3`}
//       >
//         <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
//           <Icon className="text-white" size={24} />
//         </div>
//         <h3 className="text-white font-bold text-lg">{title}</h3>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center h-48">
//           <span className="loading loading-spinner loading-lg text-primary"></span>
//         </div>
//       ) : data.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-48 text-gray-400">
//           <Icon size={48} className="mb-2 opacity-20" />
//           <p>কোনো তথ্য নেই</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="table table-zebra">
//             <thead className="bg-gray-50">
//               <tr>
//                 {columns.map((col, idx) => (
//                   <th key={idx} className="text-gray-700 font-semibold">
//                     {col}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((row, idx) => (
//                 <tr key={idx} className="hover:bg-blue-50 transition-colors">
//                   {Object.values(row).map((val, i) => (
//                     <td key={i} className="font-medium text-gray-700">
//                       {val}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// const ProgressCard = ({
//   title,
//   completed,
//   total,
//   percentage,
//   icon: Icon,
//   color,
// }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-xl p-6">
//       <div className="flex items-center gap-3 mb-4">
//         <div className={`p-3 rounded-xl bg-${color}-100`}>
//           <Icon className={`text-${color}-600`} size={28} />
//         </div>
//         <div className="flex-1">
//           <h4 className="font-semibold text-gray-800">{title}</h4>
//           <p className="text-sm text-gray-600">
//             {completed} / {total} সম্পন্ন
//           </p>
//         </div>
//         <div className="text-3xl font-bold text-gray-800">{percentage}%</div>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//         <div
//           className={`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full transition-all duration-500`}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//     </div>
//   );
// };

const DashboardHome = () => {


  // const getAuthHeaders = () => {
  //   return {
  //     "Content-Type": "application/json",
  //   };
  // };

  // const fetchUserInfo = async () => {
  //   try {
  //     const response = await fetch(`${baseURL}/dashboard/verify-token`, {
  //       method: "GET",
  //       headers: getAuthHeaders(),
  //       credentials: "include",
  //     });

  //     // console.log("User Info Response:", await response.json());

  //     if (response.ok) {
  //       const data = await response.json();
  //       // console.log("User Info Data:", data);
  //       if (data.authenticated && data.user) {
  //         // setUserName(`${data.user.name}`);
  //         // setUserRole(data.user.role);
  //         return data.user;
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user info:", error);
  //   }
  //   return null;
  // };





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

 <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded shadow">
          <h2>Total Students</h2>
          <p className="text-2xl font-bold">120</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Monthly Income</h2>
          <p className="text-2xl font-bold">৳ 2,40,000</p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2>Due Amount</h2>
          <p className="text-2xl font-bold text-red-500">৳ 35,000</p>
        </div>
      </div>

      {/* Statistics Cards
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total number"
          value={"10000"}
          icon={GraduationCap}
          gradient="from-blue-500 to-indigo-600"
          loading={loading}
        />

      </div> */}

      {/* Progress Cards
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProgressCard
          title="any Title"
          completed={"100"}
          total={"1000"}
          percentage={"10"}
          icon={CheckCircle}
          color="green"
        />

      </div> */}

      {/* Pending Students Alert */}

    </div>
  );
}


export default DashboardHome;