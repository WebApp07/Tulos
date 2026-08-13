"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaLink,
} from "react-icons/fa6";
import { Check } from "lucide-react";

interface BlogShareProps {
  title?: string;
  url?: string;
}

const BlogShare = ({ title, url }: BlogShareProps) => {
  const t = useTranslations("blog");
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const socials = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl,
      )}&text=${encodeURIComponent(title || "")}`,
      Icon: FaXTwitter,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl,
      )}`,
      Icon: FaFacebookF,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl,
      )}`,
      Icon: FaLinkedinIn,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-darkColor">{t("share")}</span>
      {socials.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-darkColor/20 text-darkColor hover:bg-darkColor hover:text-white hoverEffect"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-darkColor/20 text-darkColor hover:bg-darkColor hover:text-white hoverEffect"
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <FaLink className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default BlogShare;