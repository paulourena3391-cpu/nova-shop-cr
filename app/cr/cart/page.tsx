import type { Metadata } from 'next';
import CartView from '@/components/CartView';

export const metadata: Metadata = {
  title: 'Carrito',
};

export default function CRCartPage() {
  return <CartView />;
}
