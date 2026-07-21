import { requiredUser } from "@/hooks/requiredUser";
import React from "react";

const page = async () => {
  const user = await requiredUser();

  return <div>page</div>;
};

export default page;
