import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  setProducts: (products: Product[]) => void;
}

const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    brand: '宝娜斯',
    item_no: '8080',
    crotch_type: 'T_crotch',
    thickness: '15D',
    material: 'core_spun',
    cover_url: 'https://placehold.co/400x600/e2e8f0/1e293b?text=商品1',
    link: '',
    comment: '穿着非常舒适，耐穿。'
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    brand: '浪莎',
    item_no: 'A12',
    crotch_type: 'seamless',
    thickness: '5D',
    material: 'velvet',
    cover_url: 'https://placehold.co/400x600/e2e8f0/1e293b?text=商品2',
    link: '',
    comment: ''
  },
  {
    id: '3',
    created_at: new Date().toISOString(),
    brand: '梦娜',
    item_no: 'M99',
    crotch_type: 'one_line',
    thickness: '10D',
    material: 'xuedaili',
    cover_url: 'https://placehold.co/400x600/e2e8f0/1e293b?text=商品3',
    link: '',
    comment: '光泽感很好。'
  }
];

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: INITIAL_MOCK_PRODUCTS,
      addProduct: (product) => set((state) => ({ 
        products: [product, ...state.products] 
      })),
      updateProduct: (updatedProduct) => set((state) => ({
        products: state.products.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      setProducts: (products) => set({ products }),
    }),
    {
      name: 'product-storage',
    }
  )
);
