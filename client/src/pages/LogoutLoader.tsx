// src/pages/LogoutLoader.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";

const LogoutLoader: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000); // espera 2s antes de mandar pro login

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <Loader />
      <p className="mt-6 text-gray-600 font-medium animate-pulse">
        Saindo...
      </p>
    </div>
  );
};

export default LogoutLoader;
