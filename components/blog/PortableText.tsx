import {
  PortableText as PortableTextReact,
  type PortableTextComponents,
} from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Post } from "@/sanity.types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold text-darkColor mt-10 mb-4 leading-snug">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-bold text-darkColor mt-8 mb-3 leading-snug">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-bold text-darkColor mt-6 mb-2 leading-snug">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="text-base text-lightColor leading-relaxed my-4">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-darkColor bg-lightBg rounded-r-lg px-5 py-4 my-6 italic text-darkColor">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-darkColor">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      const className =
        "text-darkBlue underline underline-offset-2 hover:text-darkColor hoverEffect";
      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 text-lightColor space-y-2 my-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 text-lightColor space-y-2 my-4">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-lightColor leading-relaxed">{children}</li>
    ),
    number: ({ children }) => (
      <li className="text-lightColor leading-relaxed">{children}</li>
    ),
  },
  types: {
    table: ({ value }: { value: { headers?: string[]; rows?: { cells?: string[] }[] } }) => {
      const headers = value?.headers ?? [];
      const rows = value?.rows ?? [];
      if (headers.length === 0) return null;
      return (
        <div className="my-8 overflow-x-auto rounded-xl border border-darkColor/10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-darkColor text-white">
                {headers.map((header, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-3 text-left font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-lightBg"}
                >
                  {(row.cells ?? []).map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 align-top text-lightColor ${
                        j === 0 ? "font-semibold text-darkColor" : ""
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    image: ({
      value,
    }: {
      value: SanityImageSource & { caption?: string };
    }) => (
      <figure className="my-8">
        <Image
          src={urlFor(value).width(1200).auto("format").url()}
          width={1200}
          height={675}
          alt={value?.caption || "Blog image"}
          className="w-full h-auto object-cover rounded-lg"
        />
        {value?.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

const BlogPortableText = ({ value }: { value: NonNullable<Post["body"]> }) => {
  if (!value || !Array.isArray(value)) return null;
  return <PortableTextReact value={value} components={components} />;
};

export default BlogPortableText;