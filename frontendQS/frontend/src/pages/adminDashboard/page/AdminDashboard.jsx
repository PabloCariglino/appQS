import "bootstrap/dist/css/bootstrap.min.css";
import { Outlet } from "react-router-dom";
import FooterDashboard from "../../../components/FooterDashboard";
import NavbarDashboard from "../../../components/NavbarDashboard";

const AdminDashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarDashboard />
      <main className="flex-1 pt-16 sm:pt-20 pb-14 sm:pb-16">
        <Outlet />
      </main>
      <FooterDashboard />
    </div>
  );
};

export default AdminDashboard;
