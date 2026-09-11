import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Package,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface MenuProps {
  onClose: () => void;
}

export default function Menu({ onClose }: MenuProps) {
  const [userAdmin, setUserAdmin] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUserAdmin(Boolean(user && user.role === "admin"));
  }, [user]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/20 backdrop-blur-sm md:items-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          ref={panelRef}
          initial={{ y: 36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 36, opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="w-full rounded-t-[28px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-5 shadow-2xl md:mt-4 md:w-full md:max-w-xs md:rounded-[28px] md:border md:border-slate-200 md:p-5"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Sua área</p>
              <p className="text-sm text-slate-500">
                Acesse conta, pedidos e gestão.
              </p>
            </div>
            <button
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 active:scale-[0.98] active:bg-slate-100"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {userAdmin && (
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] active:bg-slate-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
            <Link
              to="/account"
              onClick={onClose}
              className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] active:bg-slate-100"
            >
              <User className="h-4 w-4" />
              Minha Conta
            </Link>
            <Link
              to="/minhas-compras"
              onClick={onClose}
              className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] active:bg-slate-100"
            >
              <Package className="h-4 w-4" />
              Minhas Compras
            </Link>
            <button
              onClick={handleLogout}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
