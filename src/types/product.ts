export type Product = {
  _id: string;
  slug: string;
  title: string;
  image: string;
  images: string[];
  brand?: string;
  rating: number;
  price: number;
  oldPrice: number | null;
  discount: number | null;
  collection: "new" | "top" | "detail" | "related";
  category: string;
  styles: string[];
  description: string;
  colors: string[];
  sizes: string[];
};
