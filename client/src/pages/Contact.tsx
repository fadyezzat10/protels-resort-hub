import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import EditableText from "@/components/EditableText";
import SEOHead, { getBreadcrumbJsonLd } from "@/components/SEOHead";
import { useI18n } from "@/lib/i18n";
import { usePageHeroImage, useMergedHotels } from "@/lib/cms";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { useState } from "react";

export default function Contact() {
  const { t, language } = useI18n();
  const heroImg = usePageHeroImage("contact", "");
  const isAr = language === "ar";
  const { hotels } = useMergedHotels();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", hotel: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);

    if (!formData.email.trim()) {
      setEmailError(true);
      document.getElementById("contact-email")?.focus();
      return;
    }

    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", hotel: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead
        title="Contact Us | Protels Hotels & Resorts – Get in Touch"
        description="Contact Protels Hotels & Resorts for reservations, inquiries, and support. Find phone numbers, email addresses, and locations for all our resorts in Marsa Alam, Hurghada, and Zanzibar."
        keywords="Protels contact, Marsa Alam hotel phone, Red Sea resort reservations, Zanzibar hotel contact"
        ogTitle="Contact Protels Hotels & Resorts"
        ogDescription="Get in touch with Protels Hotels & Resorts for bookings and inquiries."
        ogImage="https://protels.com/images/hotel-royal-bay-hero-edited.webp"
        jsonLd={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <Navbar />
      <PageBreadcrumb items={[{ label: t("nav.contact") }]} />
      <Hero 
        image={heroImg}
        title={t("nav.contact")}
        subtitle="We're Here For You"
        height="half"
        showButton={false}
        editPrefix="contact.hero"
      />

      <div className="container-padding py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <EditableText
            contentKey="contact.title"
            defaultValue={t("contact.title")}
            as="h2"
            className="text-3xl md:text-4xl font-serif text-brand-blue mb-4"
          />
          <div className="w-24 h-1 bg-brand-gold mx-auto" />
        </div>

        <div className="max-w-3xl mx-auto mb-20">
          <Card className="p-8 md:p-10 border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-serif text-brand-blue mb-6">{t("contact.form.title")}</h3>

            {status === "success" && (
              <div data-testid="text-contact-success" className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-md mb-6 border border-green-200">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{t("contact.form.success")}</p>
              </div>
            )}
            {status === "error" && (
              <div data-testid="text-contact-error" className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{t("contact.form.error")}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">{t("contact.form.name")} *</Label>
                  <Input
                    id="contact-name"
                    data-testid="input-contact-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder={t("contact.form.namePlaceholder")}
                    className="bg-gray-50 border-gray-200 focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">{t("contact.form.email")} *</Label>
                  <Input
                    id="contact-email"
                    data-testid="input-contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); setEmailError(false); }}
                    placeholder={t("contact.form.emailPlaceholder")}
                    className={`bg-gray-50 focus:border-brand-gold ${emailError ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">
                      {isAr ? "البريد الإلكتروني مطلوب" : "Email address is required"}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">{t("contact.form.phone")}</Label>
                  <Input
                    id="contact-phone"
                    data-testid="input-contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder={t("contact.form.phonePlaceholder")}
                    className="bg-gray-50 border-gray-200 focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("contact.form.hotel")}</Label>
                  <Select value={formData.hotel} onValueChange={(v) => setFormData(p => ({ ...p, hotel: v }))}>
                    <SelectTrigger data-testid="select-contact-hotel" className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder={t("contact.form.generalInquiry")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t("contact.form.generalInquiry")}</SelectItem>
                      {hotels.map(h => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">{t("contact.form.message")} *</Label>
                <Textarea
                  id="contact-message"
                  data-testid="input-contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder={t("contact.form.messagePlaceholder")}
                  className="bg-gray-50 border-gray-200 focus:border-brand-gold resize-none"
                />
              </div>

              <Button
                type="submit"
                data-testid="button-contact-submit"
                disabled={sending}
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-blue font-bold px-8 py-3 rounded-none uppercase tracking-widest text-xs"
              >
                {sending ? t("contact.form.sending") : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {t("contact.form.submit")}
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="p-8 lg:p-10 lg:col-span-2 bg-white">
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-2 block">
                        {hotel.location}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-serif text-brand-blue font-medium">
                        {hotel.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 flex-grow">
                      {(hotel.address || hotel.location) && (
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-gold shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">{t("contact.address")}</h4>
                            <p className="text-gray-600 leading-relaxed">{hotel.address || hotel.location}</p>
                          </div>
                        </div>
                      )}

                      {(hotel.phone || hotel.mobile) && (
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-gold shrink-0">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">{t("contact.phone")}</h4>
                            <div className="text-gray-600 space-y-1">
                              {hotel.phone && (
                                <a href={`tel:${hotel.phone}`} className="block hover:text-brand-blue transition-colors">
                                  {hotel.phone}
                                </a>
                              )}
                              {hotel.mobile && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 uppercase">{t("contact.mobile")}:</span>
                                  <a href={`tel:${hotel.mobile}`} className="hover:text-brand-blue transition-colors">
                                    {hotel.mobile}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {(hotel.emailReservations || hotel.emailSales || hotel.email) && (
                        <div className="flex items-start gap-4 md:col-span-2">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-gold shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="w-full">
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">{t("contact.email")}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {hotel.emailReservations ? (
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between group hover:border-brand-gold/30 transition-colors">
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-0.5">{t("contact.reservations")}</span>
                                    <a href={`mailto:${hotel.emailReservations}`} className="text-brand-blue font-medium hover:underline text-sm break-all">
                                      {hotel.emailReservations}
                                    </a>
                                  </div>
                                </div>
                              ) : hotel.email ? (
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between group hover:border-brand-gold/30 transition-colors">
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-0.5">{t("contact.email")}</span>
                                    <a href={`mailto:${hotel.email}`} className="text-brand-blue font-medium hover:underline text-sm break-all">
                                      {hotel.email}
                                    </a>
                                  </div>
                                </div>
                              ) : null}
                              {hotel.emailSales && (
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center justify-between group hover:border-brand-gold/30 transition-colors">
                                  <div>
                                    <span className="text-xs text-gray-500 block mb-0.5">{t("contact.sales")}</span>
                                    <a href={`mailto:${hotel.emailSales}`} className="text-brand-blue font-medium hover:underline text-sm break-all">
                                      {hotel.emailSales}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 min-h-[300px] lg:min-h-full border-l border-gray-100 relative group">
                  {hotel.mapEmbed ? (
                    <iframe
                      src={hotel.mapEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "300px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`${hotel.name} location map`}
                      className="grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[300px] text-gray-400 text-sm">
                      {t("contact.noMap")}
                    </div>
                  )}
                  {hotel.mapShareUrl && (
                    <div className="absolute bottom-4 right-4">
                      <Button size="sm" variant="secondary" className="bg-white shadow-md hover:bg-brand-blue hover:text-white" asChild>
                        <a
                          href={hotel.mapShareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("contact.openMaps")}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
