import { Category } from "@/sanity.types";
import { Repeat } from "lucide-react";
import React from "react";

interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
  categories: Category[];
}

const HomeTabbar = ({ selectedTab, onTabSelect, categories }: Props) => {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold">
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {categories?.map((item) => (
          <button
            key={item?._id}
            onClick={() => onTabSelect(item?.slug?.current as string)}
            className={`border border-darkColor px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-darkColor hover:text-white hoverEffect ${selectedTab === item?.slug?.current && "bg-darkColor text-white"}`}
          >
            {item?.title}
          </button>
        ))}
      </div>
      <button className="border border-darkColor p-2 rounded-full hover:bg-darkColor hover:text-white hoverEffect">
        <Repeat className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HomeTabbar;
