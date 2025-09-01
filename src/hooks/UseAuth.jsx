import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
  }, []);
};

export default useAuth;