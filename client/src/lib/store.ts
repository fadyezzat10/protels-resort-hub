import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  lastUpdated: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  image: string;
  status: 'draft' | 'published';
}

interface SiteSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  gtmHead: string;
  gtmBody: string;
}

interface CMSState {
  settings: SiteSettings;
  pages: Page[];
  hotels: Hotel[];
  updateSettings: (settings: Partial<SiteSettings>) => void;
  addPage: (page: Page) => void;
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, hotel: Partial<Hotel>) => void;
  deleteHotel: (id: string) => void;
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set) => ({
      settings: {
        name: "PROTELS",
        phone: "+1 (555) 123-4567",
        email: "contact@protels.com",
        address: "123 Luxury Ave, Beverly Hills, CA 90210",
        facebook: "https://facebook.com/protels",
        instagram: "https://instagram.com/protels",
        linkedin: "https://linkedin.com/company/protels",
        gtmHead: "",
        gtmBody: "",
      },
      pages: [
        { id: '1', title: 'About Us', slug: '/about', content: 'About content...', status: 'published', lastUpdated: new Date().toISOString() },
        { id: '2', title: 'Contact', slug: '/contact', content: 'Contact content...', status: 'published', lastUpdated: new Date().toISOString() },
      ],
      hotels: [
        { id: '1', name: 'Royal Bay Resort', slug: 'royal-bay', description: 'Experience luxury...', location: 'Maldives', image: '/assets/images/hotel-royal-bay.jpg', status: 'published' },
        { id: '2', name: 'Crystal Beach Hotel', slug: 'crystal-beach', description: 'Crystal clear waters...', location: 'Bahamas', image: '/assets/images/hotel-crystal-beach.jpg', status: 'published' },
      ],
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
      updatePage: (id, newPage) => set((state) => ({
        pages: state.pages.map((p) => (p.id === id ? { ...p, ...newPage, lastUpdated: new Date().toISOString() } : p)),
      })),
      deletePage: (id) => set((state) => ({ pages: state.pages.filter((p) => p.id !== id) })),
      addHotel: (hotel) => set((state) => ({ hotels: [...state.hotels, hotel] })),
      updateHotel: (id, newHotel) => set((state) => ({
        hotels: state.hotels.map((h) => (h.id === id ? { ...h, ...newHotel } : h)),
      })),
      deleteHotel: (id) => set((state) => ({ hotels: state.hotels.filter((h) => h.id !== id) })),
    }),
    {
      name: 'cms-storage',
    }
  )
);
