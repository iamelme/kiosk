import Button from "@renderer/shared/components/ui/Button";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export default function Index(): ReactNode {
  const navigate = useNavigate();
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="fade-up delay-2 four-o-four mb-6">404</div>

        <div className="fade-up delay-3 flex items-center justify-center gap-4 mb-6">
          <div className="divider"></div>
          <span className="text-xs tracking-widest uppercase opacity-50">
            Screen not found
          </span>
          <div className="divider"></div>
        </div>

        <p className="fade-up delay-4 text-sm font-light leading-relaxed opacity-60 max-w-xs mb-10">
          The Screen you're looking for doesn't exist or has been moved to a new
          address.
        </p>

        <div className="fade-up delay-5 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </main>
    </>
  );
}
