import { Clock, Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import { getTranslations } from "next-intl/server";

interface Props {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

type FooterTitleKey = "visitUs" | "chatWhatsapp" | "workingHours" | "emailUs";

const data: (Omit<Props, "title"> & { title: FooterTitleKey })[] = [
  {
    title: "visitUs",
    subtitle: " 63 N Burritt Ave Rm 100 Pmb 1180, Buffalo, Wyoming 82834 USA",
    icon: (
      <MapPin className="text-gray-600 group-hover:text-darkColor transition-colors" />
    ),
  },
  {
    title: "chatWhatsapp",
    subtitle: "+1 307 785 6160",
    icon: (
      <Phone className="text-gray-600 group-hover:text-darkColor transition-colors" />
    ),
  },
  {
    title: "workingHours",
    subtitle: "Mon - Sat: 10:00 AM - 7:00 PM",
    icon: (
      <Clock className="text-gray-600 group-hover:text-darkColor transition-colors" />
    ),
  },
  {
    title: "emailUs",
    subtitle: "support@keyversely.com",
    icon: (
      <Mail className="text-gray-600 group-hover:text-darkColor transition-colors" />
    ),
  },
];
const FooterTop = async () => {
  const t = await getTranslations("footer");
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-b">
      {data?.map((item, index) => (
        <ContactItem
          key={index}
          icon={item?.icon}
          title={t(item.title)}
          subtitle={item?.subtitle}
        />
      ))}
    </div>
  );
};

const ContactItem = ({ icon, title, subtitle }: Props) => {
  return (
    <div className="flex items-center gap-3 group hover:bg-gray-50 p-4 transition-colors">
      {icon}
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-darkColor transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mt-1 group-hover:text-gray-900 transition-colors">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default FooterTop;
