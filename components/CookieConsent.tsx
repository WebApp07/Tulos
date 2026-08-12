"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "tulos-cookie-consent";

const CookieConsent = () => {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDecision = (value: "accepted" | "declined") => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-screen-xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Cookie className="w-6 h-6 text-darkColor shrink-0 mt-0.5" />
              <p className="text-sm text-lightColor leading-relaxed max-w-2xl">
                {t("message")}{" "}
                <Link
                  href="/privacy"
                  className="text-darkColor font-semibold underline underline-offset-2 hoverEffect"
                >
                  {t("privacyLink")}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleDecision("declined")}
                className="px-5 py-2.5 text-sm font-semibold text-darkColor border border-darkColor/30 rounded-lg hover:bg-gray-50 hoverEffect"
              >
                {t("decline")}
              </button>
              <button
                onClick={() => handleDecision("accepted")}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-darkColor rounded-lg hover:bg-gray-800 hoverEffect"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;