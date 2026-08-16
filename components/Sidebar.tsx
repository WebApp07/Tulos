import { Category } from "@/sanity.types";
import React, { FC } from "react";
import { motion } from "motion/react";
import Logo from "./Logo";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useOutsideClick } from "@/hooks/useOutsideClick";
 
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}
 
const Sidebar: FC<SidebarProps> = ({ isOpen, onClose, categories }) => {
  const t = useTranslations("header");
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-darkColor/50 shadow-xl hoverEffect cursor-auto w-full ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-darkColor text-white/70 h-full p-10 border-r border-r-white flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <button onClick={onClose}>
            <Logo className="text-white">Licendi</Logo>
          </button>
          <button className="hover:text-red-500 hoverEffect" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 text-base font-semibold tracking-wide">
          <Link
            onClick={onClose}
            href={"/"}
            className={`hover:text-white hoverEffect w-24 ${
              pathname === "/" && "text-white"
            }`}
          >
            {t("home")}
          </Link>
          {categories?.map((item) => (
            <Link
              onClick={onClose}
              key={item?._id}
              href={`/category/${item?.slug?.current}`}
              className={`hover:text-white hoverEffect w-24 ${
                pathname === `/category/${item?.slug?.current}` && "text-white"
              }`}
            >
              {item?.title}
            </Link>
          ))}
          <Link
            onClick={onClose}
            href={"/blog"}
            className={`hover:text-white hoverEffect w-24 ${
              pathname.startsWith("/blog") && "text-white"
            }`}
          >
            {t("blog")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
