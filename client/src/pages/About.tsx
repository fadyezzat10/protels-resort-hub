import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ArrowRight, Star, Anchor, Sun, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Images
import crystalBeachImg from "@assets/Protels_Crystal_Beach_Resort_1770196464483.png";
import beachClubImg from "@assets/DSC05597.png11_1770196278235.png";
import royalBayImg from "@assets/WhatsApp_Image_2025-12-22_at_12.58.16_PM_(1)_1770197117342.jpeg";
import laPlageImg from "@assets/22_1770196761222.png";
import siteHeroImg from "@/assets/images/site-hero.png";

export default function About() {
  const { t } = useI18n();

  const fadeIn = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
    viewport: { once: true }
  };

  const resorts = [
    {
      id: "crystal-beach",
      name: "Protels Crystal Beach Resort",
      location: "Marsa Alam, Egypt",
      desc: "A sanctuary of refined luxury on the Red Sea. Where pristine sands meet crystal waters, offering an exclusive escape for those seeking serenity and style.",
      highlight: "Private Sandy Beach & Coral Reef",
      image: crystalBeachImg
    },
    {
      id: "beach-club",
      name: "Protels Beach Club & Spa",
      location: "Marsa Alam, Egypt",
      desc: "Vibrant energy meets coastal relaxation. A modern family paradise featuring endless aquatic adventures and sun-soaked leisure in Marsa Alam.",
      highlight: "Aquapark & Wellness Center",
      image: beachClubImg
    },
    {
      id: "royal-bay",
      name: "Protels Royal Bay Resort & Spa",
      location: "Hurghada, Egypt",
      desc: "Elegant sophistication in the heart of Hurghada. A perfect blend of grand architecture and warm hospitality, creating timeless memories by the sea.",
      highlight: "Premium All-Inclusive Luxury",
      image: royalBayImg
    },
    {
      id: "la-plage",
      name: "Protels La Plage",
      location: "Zanzibar, Tanzania",
      desc: "Barefoot luxury on the spice island. An intimate boutique retreat in Zanzibar celebrating Swahili culture and the gentle rhythm of the Indian Ocean.",
      highlight: "Boutique Swahili Experience",
      image: laPlageImg
    }
  ];

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Authentic Hospitality",
      desc: "Service that comes from the heart, anticipating your every need with warmth and grace."
    },
    {
      icon: <Anchor className="w-6 h-6" />,
      title: "Prime Locations",
      desc: "Resorts nestled in the most breathtaking coastal destinations, celebrating nature's beauty."
    },
    {
      icon: <Sun className="w-6 h-6" />,
      title: "Curated Experiences",
      desc: "From sunrise yoga to culinary journeys, we craft moments that linger in your memory."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-white font-sans selection:bg-brand-gold/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Subtle dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10" />
        
        <motion.img 
          src={siteHeroImg} 
          alt="Protels Luxury Aerial View"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
        
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <span className="text-white/80 text-sm md:text-base tracking-[0.3em] uppercase font-light mb-8 block drop-shadow-sm">
              Welcome to Protels
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight drop-shadow-lg">
              Crafting Unforgettable <br className="hidden md:block" /> Seaside Experiences
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-sans font-light max-w-2xl mx-auto leading-relaxed tracking-wide drop-shadow-md">
              Where authentic hospitality meets the timeless beauty of the coast.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Brand Story */}
      <section className="py-24 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div {...fadeIn}>
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-4 block">
              Our Story
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-blue mb-8 leading-tight">
              Redefining Luxury Through <br />
              <span className="italic text-brand-gold">Authentic Connection</span>
            </h2>
            <div className="w-24 h-1 bg-brand-gold mx-auto mb-10" />
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light">
              At PROTELS Hotels & Resorts, we believe that true luxury lies in the feeling of belonging. Born from a passion for the sea and a dedication to authentic hospitality, our collection of beachfront resorts offers more than just a stay—we offer a journey into the extraordinary. From the vibrant coral reefs of the Red Sea to the spice-scented breezes of Zanzibar, each property is a gateway to its unique destination.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-20 bg-gray-50">
        <div className="container-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-10 shadow-sm border-t-2 border-brand-gold hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-2xl text-brand-blue mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Resorts */}
      <section className="py-24 bg-white">
        <div className="container-padding">
          <motion.div 
            {...fadeIn} 
            className="text-center mb-20"
          >
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-3 block">
              Our Collection
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-blue">
              Discover Our Resorts
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-24">
            {resorts.map((resort, index) => (
              <motion.div 
                key={resort.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
              >
                <div className="w-full lg:w-1/2 overflow-hidden shadow-xl rounded-sm">
                  <div className="aspect-[4/3] relative group overflow-hidden">
                    <img 
                      src={resort.image} 
                      alt={resort.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <span className="text-brand-gold text-sm font-bold tracking-widest uppercase mb-3 block">
                    {resort.location}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-serif text-brand-blue mb-6">
                    {resort.name}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
                    {resort.desc}
                  </p>
                  
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                    <div className="flex items-center gap-3 text-brand-blue/80">
                      <Star className="w-5 h-5 fill-brand-gold text-brand-gold" />
                      <span className="font-medium italic">{resort.highlight}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Experience Philosophy */}
      <section className="py-24 bg-brand-blue text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
                Guest Experience <br />
                <span className="text-brand-gold italic">Philosophy</span>
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8 font-light">
                From the moment you arrive, you are wrapped in a warmth that feels like home, yet elevated by service that anticipates your every need. We curate moments of wonder—from sunrise walks on private beaches to star-lit dinners by the ocean.
              </p>
              <ul className="space-y-4">
                {[
                  "Personalized service tailored to your preferences",
                  "Immersive cultural and culinary experiences",
                  "Holistic wellness and rejuvenation"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/90">
                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square relative z-10 p-6 border border-white/20">
                <div className="w-full h-full bg-white/5 backdrop-blur-sm flex items-center justify-center p-12 text-center">
                   <div className="space-y-6">
                     <Heart className="w-12 h-12 text-brand-gold mx-auto" />
                     <p className="font-serif text-2xl italic">
                       "We don't just provide a place to sleep; we provide a canvas for your most cherished memories."
                     </p>
                   </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 border-t-2 border-r-2 border-brand-gold/50" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 border-b-2 border-l-2 border-brand-gold/50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-24 bg-white text-center">
        <div className="container-padding max-w-4xl mx-auto">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-serif text-brand-blue mb-8">
              Your Journey Begins Here
            </h2>
            <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed">
              Discover a world where time slows down, and every moment is a treasured memory. <br className="hidden md:block" />
              We invite you to experience the authentic warmth of PROTELS.
            </p>
            <Button size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-10 py-6 text-lg rounded-none uppercase tracking-widest" asChild>
               <a href="/hotels">Explore Our Resorts</a>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
