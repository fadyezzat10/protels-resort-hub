import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useFooterContent, useHeaderLogo, useMergedHotels } from "@/lib/cms";
import defaultLogo from "@assets/سش.pngش_1770193463633.png";

export default function Footer() {
  const { t, language } = useI18n();
  const currentYear = new Date().getFullYear();
  const { address, phone, email, socialLinks, description, siteName } = useFooterContent(language);
  const { hotels } = useMergedHotels();
  const cmsLogo = useHeaderLogo();
  const logoSrc = cmsLogo || defaultLogo;

  const socialIconList: { key: string; Icon: any; fallbackUrl: string }[] = [
    { key: "facebook", Icon: Facebook, fallbackUrl: "https://www.facebook.com/ProtelsResorts/" },
    { key: "instagram", Icon: Instagram, fallbackUrl: "https://www.instagram.com/protelsresorts" },
    { key: "linkedin", Icon: Linkedin, fallbackUrl: "https://www.linkedin.com/company/protelsresorts/" },
  ];

  return (
    <footer className="bg-brand-blue text-white pt-12 pb-6 border-t border-brand-gold/10">
      <div className="container-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          <div className="space-y-6 flex flex-col items-start">
            <img src={logoSrc} alt={siteName} className="h-auto w-48 md:w-64 max-w-full object-contain object-left mb-2" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs font-sans">
              {description || t("about.desc")}
            </p>
          </div>

          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">{t("nav.hotels")}</h3>
            <ul className="space-y-4 font-sans text-sm">
              {hotels.map((hotel) => (
                <li key={hotel.id}>
                  <Link href={`/hotels/${hotel.id}`} className="text-white/60 hover:text-brand-gold transition-colors tracking-wide">{hotel.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">{t("nav.contact")}</h3>
            <ul className="space-y-6 font-sans text-sm">
              <li className="flex items-start gap-4 text-white/60">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-brand-gold/50" />
                <span className="leading-relaxed">{address}</span>
              </li>
              <li className="flex items-center gap-4 text-white/60">
                <Phone className="w-5 h-5 shrink-0 text-brand-gold/50" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="tracking-widest hover:text-brand-gold transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-4 text-white/60">
                <Mail className="w-5 h-5 shrink-0 text-brand-gold/50" />
                <a href={`mailto:${email}`} className="tracking-wide hover:text-brand-gold transition-colors">{email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">Connect</h3>
            <div className="flex gap-6">
              {socialIconList.map(({ key, Icon, fallbackUrl }) => {
                const url = (socialLinks as Record<string, string>)[key] || fallbackUrl;
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand-gold transition-all transform hover:scale-110">
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
            <div className="mt-8 bg-white/5 p-6 rounded-none border border-white/10">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                {description || "Experience the pinnacle of coastal luxury across our exclusive portfolio."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-white/20 text-[0.65rem] uppercase tracking-[0.3em] gap-4">
          <p>&copy; {currentYear} {siteName}. {t("footer.rights")}.</p>
        </div>
      </div>
    </footer>
  );
}
