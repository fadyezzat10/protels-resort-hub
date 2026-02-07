import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { hotels as initialHotels, Hotel } from './data';

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robots: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  status: 'draft' | 'published';
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  seo: SEO;
}

export interface GlobalSettings {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  logo?: string;
  favicon?: string;
  gtmHead: string;
  gtmBody: string;
}

interface CMSState {
  pages: Page[];
  hotels: Hotel[]; // Using the existing Hotel interface from data.ts
  settings: GlobalSettings;
  media: string[];
  
  // Actions
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  
  addPage: (page: Page) => void;
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;
  
  addHotel: (hotel: Hotel) => void;
  updateHotel: (id: string, hotel: Partial<Hotel>) => void;
  deleteHotel: (id: string) => void;
  
  addMedia: (url: string) => void;
  deleteMedia: (url: string) => void;
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set) => ({
      pages: [
        {
          id: 'home',
          title: 'Home',
          slug: '/',
          content: '<h1>Welcome to Protels</h1>',
          status: 'published',
          lastUpdatedBy: 'System',
          lastUpdatedAt: new Date().toISOString(),
          seo: {
            metaTitle: 'Protels Hotels & Resorts',
            metaDescription: 'Luxury beach resorts in Egypt and Zanzibar',
            metaKeywords: 'hotels, resorts, beach, luxury',
            ogTitle: 'Protels Hotels & Resorts',
            ogDescription: 'Luxury beach resorts in Egypt and Zanzibar',
            ogImage: '',
            robots: 'index, follow'
          }
        },
        {
            id: 'about',
            title: 'About Us',
            slug: '/about',
            content: '<p>About Protels content...</p>',
            status: 'published',
            lastUpdatedBy: 'System',
            lastUpdatedAt: new Date().toISOString(),
            seo: {
              metaTitle: 'About - Protels',
              metaDescription: 'Learn more about Protels',
              metaKeywords: 'about, history, team',
              ogTitle: 'About - Protels',
              ogDescription: 'Learn more about Protels',
              ogImage: '',
              robots: 'index, follow'
            }
          }
      ],
      hotels: initialHotels,
      settings: {
        companyName: 'PROTELS Hotels & Resorts',
        phone: '+20 123 456 7890',
        email: 'info@protels.com',
        address: 'Marsa Alam, Red Sea, Egypt',
        socials: {
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          linkedin: '',
          twitter: ''
        },
        gtmHead: '',
        gtmBody: ''
      },
      media: [],

      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),

      addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),
      updatePage: (id, newPage) => set((state) => ({
        pages: state.pages.map((p) => p.id === id ? { ...p, ...newPage, lastUpdatedAt: new Date().toISOString() } : p)
      })),
      deletePage: (id) => set((state) => ({ 
        pages: state.pages.filter((p) => p.id !== id) 
      })),

      addHotel: (hotel) => set((state) => ({ hotels: [...state.hotels, hotel] })),
      updateHotel: (id, newHotel) => set((state) => ({
        hotels: state.hotels.map((h) => h.id === id ? { ...h, ...newHotel } : h)
      })),
      deleteHotel: (id) => set((state) => ({ 
        hotels: state.hotels.filter((h) => h.id !== id) 
      })),

      addMedia: (url) => set((state) => ({ media: [...state.media, url] })),
      deleteMedia: (url) => set((state) => ({ 
        media: state.media.filter((m) => m !== url) 
      })),
    }),
    {
      name: 'protels-cms-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
