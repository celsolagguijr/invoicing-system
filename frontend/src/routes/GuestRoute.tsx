import { Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

export interface IGuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<IGuestRouteProps> = (props: IGuestRouteProps) => {
  const { isValid } = useAuth();

  return isValid ? <Navigate to="/dashboard" /> : props.children;
};

export default GuestRoute;
