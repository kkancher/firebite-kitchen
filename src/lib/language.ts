"use client";

import { useSyncExternalStore } from "react";

export type AppLanguage = "en" | "fr";

const STORAGE_KEY = "firebite-language";
let currentLanguage: AppLanguage = "en";
let initialized = false;
const listeners = new Set<() => void>();

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "fr" ? "fr" : "en";
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  currentLanguage = readStoredLanguage();
  document.documentElement.lang = currentLanguage;
  initialized = true;
}

function notifyAll() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureInitialized();
  return currentLanguage;
}

function getServerSnapshot(): AppLanguage {
  return "en";
}

export function setAppLanguage(nextLanguage: AppLanguage) {
  currentLanguage = nextLanguage;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
  }
  notifyAll();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    const value = event.newValue === "fr" ? "fr" : "en";
    if (value === currentLanguage) return;
    currentLanguage = value;
    document.documentElement.lang = value;
    notifyAll();
  });
}

export const i18n = {
  en: {
    topStrip: "France: fast delivery • EU shipping available • Freshly cooked daily",
    nav: {
      home: "Home",
      about: "About",
      orders: "Orders",
      admin: "Admin",
      login: "Login",
      register: "Register",
      logout: "Logout",
      shopNow: "Shop Now",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    hero: {
      eyebrow: "Story with every bite.",
      title: "Luxury street-style food, cooked fresh daily.",
      subtitle: "Flame-grilled flavors from the heart of FireBite Kitchen. Rich, smoky, and crafted to arrive hot and unforgettable.",
      ourStory: "Our Story",
      fastDelivery: "Fast delivery",
      freshBatches: "Fresh batches",
      avgRating: "Average rating",
      craftsmanship: "Elevating flavor craftsmanship",
      premiumTitle: "Premium ingredients, exceptional taste",
      ctaTitle: "Ready for your next favorite meal?",
      ctaCopy: "Browse the menu and pick your perfect balance of spice, comfort, and sweetness.",
      startOrdering: "Start Ordering",
    },
    welcome: {
      member: "Firebite Member",
      hello: "Bonjour",
      verified: "Verified",
    },
    menu: {
      title: "Cuisine d'exception for every craving",
      subtitle: "Explore categories and order your table-worthy favorites.",
      search: "Search dishes, category...",
      sortPopular: "Sort: Popular",
      sortLow: "Price: Low to High",
      sortHigh: "Price: High to Low",
      showing: "Showing",
      item: "item",
      items: "items",
    },
    footer: {
      tagline: "French-inspired fire dining, served with elegance.",
      quickLinks: "Quick Links",
      service: "Service",
      delivery: "Paris Delivery • EU Friendly",
      schedule: "Open Daily • Fresh Kitchen",
    },
  },
  fr: {
    topStrip: "France: livraison rapide • expédition UE disponible • préparé frais chaque jour",
    nav: {
      home: "Accueil",
      about: "A propos",
      orders: "Commandes",
      admin: "Admin",
      login: "Connexion",
      register: "Inscription",
      logout: "Deconnexion",
      shopNow: "Commander",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
    },
    hero: {
      eyebrow: "Une histoire a chaque bouchee",
      title: "Cuisine inspiree de Paris, sublimee par le feu moderne.",
      subtitle: "Un menu raffine de signatures fumees, de plats reconfortants elegants et de desserts gourmands pour des soirees memorables.",
      ourStory: "Notre Histoire",
      fastDelivery: "Livraison rapide",
      freshBatches: "Fait minute",
      avgRating: "Note moyenne",
      craftsmanship: "Savoir-faire culinaire",
      premiumTitle: "Ingredients premium, gout exceptionnel",
      ctaTitle: "Pret pour votre prochain plat prefere ?",
      ctaCopy: "Parcourez le menu et trouvez votre equilibre parfait entre epice, douceur et gourmandise.",
      startOrdering: "Commencer",
    },
    welcome: {
      member: "Membre Maison",
      hello: "Bonjour",
      verified: "Verifie",
    },
    menu: {
      title: "Cuisine d'exception pour toutes les envies",
      subtitle: "Explorez les categories et commandez vos favoris dignes d'une table d'exception.",
      search: "Rechercher plats, categorie...",
      sortPopular: "Tri: Populaire",
      sortLow: "Prix: croissant",
      sortHigh: "Prix: decroissant",
      showing: "Affichage",
      item: "article",
      items: "articles",
    },
    footer: {
      tagline: "Cuisine francaise inspiree du feu, servie avec elegance.",
      quickLinks: "Liens rapides",
      service: "Service",
      delivery: "Livraison Paris • Compatible UE",
      schedule: "Ouvert tous les jours • Cuisine fraiche",
    },
  },
};

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    language,
    setLanguage: setAppLanguage,
    text: i18n[language],
  };
}
