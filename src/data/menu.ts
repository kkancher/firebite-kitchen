export type MenuItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  spicy?: boolean;
};

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Chicken Biryani",
    category: "Mains",
    description: "Aromatic basmati rice slow-cooked with tender chicken, saffron, caramelized onions, and our secret spice blend.",
    price: 14.99,
    emoji: "🍛",
    image: "/chicken-biryani.png",
    spicy: true,
  },
  {
    id: 2,
    name: "Egg Fried Rice",
    category: "Mains",
    description: "Wok-tossed jasmine rice with scrambled eggs, spring onions, soy sauce, and a drizzle of sesame oil.",
    price: 9.99,
    emoji: "🍳",
    image: "/egg-fried-rice.png",
  },
  {
    id: 3,
    name: "Chicken Wings",
    category: "Sides & Snacks",
    description: "Crispy golden wings tossed in our signature FireBite sauce — hot, smoky, and utterly addictive.",
    price: 11.99,
    emoji: "🍗",
    image: "/chicken-wings.png",
    spicy: true,
  },
  {
    id: 4,
    name: "French Fries",
    category: "Sides & Snacks",
    description: "Extra-crispy golden fries seasoned with sea salt and our house spice blend. Perfect for sharing (or not).",
    price: 4.99,
    emoji: "🍟",
    image: "/french-fries.png",
  },
  {
    id: 5,
    name: "Gulab Jamun",
    category: "Desserts",
    description: "Soft milk-solid dumplings deep-fried to perfection and soaked in rose-scented sugar syrup.",
    price: 5.99,
    emoji: "🟤",
    image: "/gulab-jamun.png",
  },
  {
    id: 6,
    name: "Panna Cotta",
    category: "Desserts",
    description: "Silky Italian cream dessert with a hint of vanilla, topped with a fresh berry coulis.",
    price: 6.49,
    emoji: "🍮",
    image: "/panna-cotta.png",
  },
];

export const categories = [...new Set(menuItems.map((item) => item.category))];