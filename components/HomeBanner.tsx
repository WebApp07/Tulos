import React from "react";
import Title from "./Title";

const HomeBanner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Title className="text-3xl md:text-4xl uppercase font-bold text-center">
          Official Microsoft Products
      </Title>
      <p className="text-sm text-center text-lightColor/80 font-medium max-w-[480px]">
          Shop genuine Microsoft software and solutions from an official Microsoft partner. Get the latest products, secure licenses, and trusted support for all your digital needs.
      </p>
    </div>
  );
};

export default HomeBanner;
