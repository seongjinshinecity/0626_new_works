export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
};

export type CartRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products: Product | null; // join
};

export const won = (n: number) => `${Number(n).toLocaleString("ko-KR")}원`;
