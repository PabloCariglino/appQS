import "bootstrap/dist/css/bootstrap.min.css";
import { Outlet } from "react-router-dom";
import FooterDashboard from "../../../components/FooterDashboard";
import NavbarDashboard from "../../../components/NavbarDashboard";

const OperatorDashboard = () => {
  return (
    <div>
      <NavbarDashboard />
      <main>
        <Outlet />
      </main>

      <FooterDashboard />
    </div>
  );
};

export default OperatorDashboard;
