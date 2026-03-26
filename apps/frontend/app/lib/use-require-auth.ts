import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getToken } from "@/lib/auth";

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    setIsAuthorized(true);
  }, [location.pathname, navigate]);

  return isAuthorized;
}
