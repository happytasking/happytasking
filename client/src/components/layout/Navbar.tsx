import { Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthNoticeModal from "../common/AuthNoticeModal";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  return (
    <header className="h-16 shadow-md flex items-center justify-between">
      <div
        className="mx-20 cursor-pointer flex items-center justify-between w-full"
        onClick={() => navigate("/")}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="size-10 rounded-full bg-primary flex text-white items-center justify-center">
            <Star className="size-7 border-none" fill="#FFFFFF" />
          </div>
          <div className="text-2xl">
            Review<span>&</span>
            <span className="font-bold">RATE</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="cursor-pointer transition-all duration-150 hover:font-medium"
          >
            Login
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="cursor-pointer transition-all duration-150 hover:font-medium"
          >
            Signup
          </button>
        </div>

        <AuthNoticeModal
          open={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </header>
  );
}

export default Navbar;
