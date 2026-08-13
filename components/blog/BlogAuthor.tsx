import { useTranslations } from "next-intl";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { UserRound } from "lucide-react";
import type { Author } from "@/sanity.types";

const BlogAuthor = ({ author }: { author: Author }) => {
  const t = useTranslations("blog");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-lightBg rounded-xl p-6">
      {author?.image ? (
        <Image
          src={urlFor(author.image).width(160).height(160).url()}
          width={80}
          height={80}
          alt={author?.name || "Author"}
          className="w-20 h-20 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
          <UserRound className="w-9 h-9 text-gray-400" />
        </div>
      )}
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1">
          {t("authorTitle")}
        </p>
        <h3 className="font-bold text-darkColor">{author?.name}</h3>
        {author?.role && (
          <p className="text-sm text-lightColor">{author?.role}</p>
        )}
        {author?.bio && (
          <p className="text-sm text-lightColor leading-relaxed mt-2">
            {author?.bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default BlogAuthor;