import "bootstrap/dist/css/bootstrap.min.css";
import { Outlet } from "react-router-dom";
import NavbarDashboard from "../../../components/NavbarDashboard";

const OperatorDashboard = () => {
  return (
    <div className="flex flex-col">
      <NavbarDashboard />
      <main className="mt-13 max-h-[calc(100vh-0rem)] overflow-y-hidden">
        <div className="h-full overflow-y-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;
