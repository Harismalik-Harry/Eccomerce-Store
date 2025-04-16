import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const Logout = () => {
  const navigate = useNavigate();
  const { authUser,logout } = useAuthStore();

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
      
      navigate("/"); 
    };

    handleLogout();
  }, [logout, navigate]);

  return <div className="text-center text-lg font-semibold">Logging out...</div>;
};

export default Logout;