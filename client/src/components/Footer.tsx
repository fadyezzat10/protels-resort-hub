import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import logo from "@assets/سش.pngش_1770193463633.png";

export default function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue text-white pt-12 pb-6 border-t border-brand-gold/10">
      <div className="container-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          {/* Brand */}
          <div className="space-y-6">
            <img src={logo} alt="PROTELS" className="h-24" />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs font-sans">
              {t("about.desc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">{t("nav.hotels")}</h3>
            <ul className="space-y-4 font-sans text-sm">
              <li><Link href="/hotels"><a className="text-white/60 hover:text-brand-gold transition-colors tracking-wide">Protels Crystal Beach</a></Link></li>
              <li><Link href="/hotels"><a className="text-white/60 hover:text-brand-gold transition-colors tracking-wide">Protels Beach Club</a></Link></li>
              <li><Link href="/hotels"><a className="text-white/60 hover:text-brand-gold transition-colors tracking-wide">Protels La Plage</a></Link></li>
              <li><Link href="/hotels"><a className="text-white/60 hover:text-brand-gold transition-colors tracking-wide">Protels Royal Bay</a></Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">{t("nav.contact")}</h3>
            <ul className="space-y-6 font-sans text-sm">
              <li className="flex items-start gap-4 text-white/60">
                <MapPin className="w-5 h-5 mt-1 shrink-0 text-brand-gold/50" />
                <span className="leading-relaxed">Marsa Alam, Red Sea, Egypt</span>
              </li>
              <li className="flex items-center gap-4 text-white/60">
                <Phone className="w-5 h-5 shrink-0 text-brand-gold/50" />
                <span className="tracking-widest">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-4 text-white/60">
                <Mail className="w-5 h-5 shrink-0 text-brand-gold/50" />
                <span className="tracking-wide">info@protels.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">Newsletter</h3>
            <p className="text-white/60 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="space-y-3" onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing!");
            }}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-brand-gold/50 transition-colors placeholder:text-white/20"
                required
              />
              <button type="submit" className="w-full bg-brand-gold text-brand-blue font-bold text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-sans text-xs uppercase tracking-[0.3em] font-bold mb-6 text-brand-gold">Connect</h3>
            <div className="flex gap-6">
              <a href="#" className="text-white/40 hover:text-brand-gold transition-all transform hover:scale-110">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white/40 hover:text-brand-gold transition-all transform hover:scale-110">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
            <div className="mt-8 bg-white/5 p-6 rounded-none border border-white/10">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 leading-relaxed">
                Experience the pinnacle of coastal luxury across our exclusive portfolio.
              </p>
            </div>
          </div>
        </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-white/20 text-[0.65rem] uppercase tracking-[0.3em] gap-4">
          <p>&copy; {currentYear} PROTELS Hotels & Resorts. {t("footer.rights")}.</p>
          <div className="flex gap-4">
            <Link href="/admin">
              <a className="hover:text-brand-gold transition-colors">Admin</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
