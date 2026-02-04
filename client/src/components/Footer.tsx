import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white pt-16 pb-8">
      <div className="container-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-brand-gold">PROTELS</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {t("about.desc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-6 text-brand-gold">{t("nav.hotels")}</h3>
            <ul className="space-y-3">
              <li><Link href="/hotels"><a className="text-white/70 hover:text-white transition-colors">Protels Crystal Beach</a></Link></li>
              <li><Link href="/hotels"><a className="text-white/70 hover:text-white transition-colors">Protels Beach Club</a></Link></li>
              <li><Link href="/hotels"><a className="text-white/70 hover:text-white transition-colors">Protels La Plage</a></Link></li>
              <li><Link href="/hotels"><a className="text-white/70 hover:text-white transition-colors">Protels Royal Bay</a></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-6 text-brand-gold">{t("nav.contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-brand-gold" />
                <span>Marsa Alam, Red Sea, Egypt</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 shrink-0 text-brand-gold" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 shrink-0 text-brand-gold" />
                <span>info@protels.com</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-6 text-brand-gold">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          <p>&copy; {currentYear} PROTELS Hotels & Resorts. {t("footer.rights")}.</p>
        </div>
      </div>
    </footer>
  );
}
