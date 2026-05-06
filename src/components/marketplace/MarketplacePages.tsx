'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Filter,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

export type MarketplaceProduct = {
  id: string;
  name: string;
  category: 'Phân bón' | 'Thuốc BVTV' | 'Giống cây trồng' | 'Vật tư khác';
  description: string;
  supplier: string;
  price: number;
  unit: string;
  image: string;
  thumbnails: string[];
};

type CartLine = {
  productId: string;
  quantity: number;
};

type MarketplaceOrder = {
  id: string;
  date: string;
  receiver: string;
  phone: string;
  address: string;
  status: 'Chờ xác nhận';
  lines: CartLine[];
};

const cartKey = 'nextfarm:marketplaceCart';
const orderKey = 'nextfarm:marketplaceOrders';

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: 'npk-16-16-8',
    name: 'Phân NPK 16-16-8',
    category: 'Phân bón',
    description: 'Phân bón NPK tổng hợp, phù hợp cho giai đoạn sinh trưởng của cây trồng.',
    supplier: 'Công ty TNHH Phân bón Việt',
    price: 450000,
    unit: 'bao 50kg',
    image: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'bio-pesticide',
    name: 'Thuốc trừ sâu Bio',
    category: 'Thuốc BVTV',
    description: 'Thuốc trừ sâu sinh học, an toàn cho môi trường và người tiêu dùng.',
    supplier: 'Công ty CP Nông dược An toàn',
    price: 280000,
    unit: 'chai 1L',
    image: 'https://images.unsplash.com/photo-1615114814213-a245ffc79e9a?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1615114814213-a245ffc79e9a?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'st25-seed',
    name: 'Giống lúa ST25',
    category: 'Giống cây trồng',
    description: 'Giống lúa thơm ST25 chất lượng cao, năng suất 7-8 tấn/ha.',
    supplier: 'Trung tâm Giống cây trồng Đồng bằng sông Cửu Long',
    price: 150000,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'mulch-film',
    name: 'Màng phủ nông nghiệp',
    category: 'Vật tư khác',
    description: 'Màng phủ PE chống cỏ dại, giữ ẩm đất hiệu quả.',
    supplier: 'Công ty TNHH Nhựa Nông nghiệp Á Châu',
    price: 1200000,
    unit: 'cuộn 100m',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'organic-compost',
    name: 'Phân hữu cơ vi sinh',
    category: 'Phân bón',
    description: 'Cải tạo đất, bổ sung vi sinh vật có lợi cho vùng canh tác.',
    supplier: 'HTX Vật tư Xanh',
    price: 180000,
    unit: 'bao 25kg',
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'drip-pipe',
    name: 'Dây tưới nhỏ giọt',
    category: 'Vật tư khác',
    description: 'Dây tưới tiết kiệm nước cho rau màu và cây ăn trái.',
    supplier: 'Thiết bị tưới Nam Việt',
    price: 640000,
    unit: 'cuộn 200m',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'vegetable-seed',
    name: 'Hạt giống rau ăn lá',
    category: 'Giống cây trồng',
    description: 'Bộ hạt giống rau ăn lá phù hợp vùng ven đô và nhà màng.',
    supplier: 'Công ty Giống Rau Việt',
    price: 95000,
    unit: 'gói',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'bio-fungicide',
    name: 'Chế phẩm phòng nấm Bio',
    category: 'Thuốc BVTV',
    description: 'Hỗ trợ phòng bệnh nấm trên rau màu, dùng theo khuyến cáo VietGAP.',
    supplier: 'Nông dược Sinh học Việt',
    price: 235000,
    unit: 'chai 500ml',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1615114814213-a245ffc79e9a?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'rice-tray',
    name: 'Khay gieo mạ',
    category: 'Vật tư khác',
    description: 'Khay nhựa gieo mạ đồng đều, tái sử dụng nhiều vụ.',
    supplier: 'Vật tư Lúa Miền Tây',
    price: 38000,
    unit: 'khay',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'calcium-boron',
    name: 'Canxi Bo hữu cơ',
    category: 'Phân bón',
    description: 'Bổ sung vi lượng, hạn chế nứt trái và tăng chất lượng nông sản.',
    supplier: 'Phân bón Sinh thái Việt',
    price: 210000,
    unit: 'chai 1L',
    image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=320&q=80',
    ],
  },
  {
    id: 'fruit-bag',
    name: 'Túi bao trái cây',
    category: 'Vật tư khác',
    description: 'Túi bao trái hạn chế sâu bệnh, giảm nám vỏ và nâng chất lượng phân loại.',
    supplier: 'Bao bì Nông nghiệp Minh An',
    price: 76000,
    unit: 'xấp 100 túi',
    image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=1100&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=320&q=80',
      'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=320&q=80',
    ],
  },
];

const confirmedOrder = {
  id: 'ORD-1778058510637-rtti84s9m',
  date: 'lúc 16:08 6 tháng 5, 2026',
  receiver: 'Nguyễn Văn A',
  phone: '0987654321',
  address: 'hà nội, nam từ liêm',
};

function formatMoney(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function loadCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(cartKey) ?? '[]') as CartLine[];
    return parsed.filter((line) => line.quantity > 0);
  } catch {
    return [];
  }
}

function saveCart(cart: CartLine[]) {
  window.localStorage.setItem(cartKey, JSON.stringify(cart.filter((line) => line.quantity > 0)));
}

function loadOrders(): MarketplaceOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(orderKey) ?? '[]') as MarketplaceOrder[];
    return parsed.filter((order) => order.lines?.length);
  } catch {
    return [];
  }
}

function saveOrders(orders: MarketplaceOrder[]) {
  window.localStorage.setItem(orderKey, JSON.stringify(orders.filter((order) => order.lines.length)));
}

function useCart() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setLoaded(true);
  }, []);

  function update(nextCart: CartLine[]) {
    setCart(nextCart);
    saveCart(nextCart);
  }

  function add(productId: string, quantity = 1) {
    const found = cart.find((line) => line.productId === productId);
    const nextCart = found
      ? cart.map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line))
      : [...cart, { productId, quantity }];
    update(nextCart);
  }

  function setQuantity(productId: string, quantity: number) {
    update(cart.map((line) => (line.productId === productId ? { ...line, quantity } : line)).filter((line) => line.quantity > 0));
  }

  function remove(productId: string) {
    update(cart.filter((line) => line.productId !== productId));
  }

  return { cart, loaded, add, setQuantity, remove, setCart: update };
}

function getCartItems(cart: CartLine[]) {
  return cart
    .map((line) => {
      const product = marketplaceProducts.find((item) => item.id === line.productId);
      return product ? { ...line, product, subtotal: product.price * line.quantity } : null;
    })
    .filter(Boolean) as Array<CartLine & { product: MarketplaceProduct; subtotal: number }>;
}

function SummaryCard({ cart, action }: { cart: CartLine[]; action: React.ReactNode }) {
  const items = getCartItems(cart);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <aside className="rounded-lg border border-[#dbe3dc] bg-white p-4">
      <h2 className="text-lg font-extrabold">Tổng kết đơn hàng</h2>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#475569]">Số lượng sản phẩm:</span>
          <strong>{items.length}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#475569]">Tổng số lượng:</span>
          <strong>{totalQuantity}</strong>
        </div>
        <div className="border-t border-[#dbe3dc] pt-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold">Tổng tiền:</span>
            <strong className="text-lg text-[#159447]">{formatMoney(total)}</strong>
          </div>
        </div>
      </div>
      <div className="mt-4">{action}</div>
      <p className="mt-3 text-center text-[11px] text-[#64748b]">Bạn sẽ xác nhận thông tin giao hàng ở bước tiếp theo</p>
    </aside>
  );
}

function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link className="inline-flex h-8 items-center gap-2 rounded-md border border-[#dbe3dc] bg-white px-3 text-sm font-semibold hover:bg-[#f8fafc]" href={href}>
      <ArrowLeft size={14} />
      {label}
    </Link>
  );
}

export function MarketplacePage() {
  const router = useRouter();
  const { add } = useCart();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const categories = ['Tất cả', 'Phân bón', 'Thuốc BVTV', 'Giống cây trồng', 'Vật tư khác'];
  const products = useMemo(
    () =>
      marketplaceProducts.filter((product) => {
        const matchQuery = `${product.name} ${product.description} ${product.supplier}`.toLowerCase().includes(query.toLowerCase());
        const matchCategory = category === 'Tất cả' || product.category === category;
        return matchQuery && matchCategory;
      }),
    [category, query],
  );

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
      <div className="rounded-lg border border-[#a7f3d0] bg-gradient-to-r from-[#ecfdf5] to-[#eff6ff] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Marketplace Nông nghiệp</h1>
            <p className="mt-1 text-sm text-[#475569]">Mua sắm vật tư nông nghiệp chất lượng cao từ các nhà cung cấp uy tín</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-9 rounded-md border border-[#dbe3dc] bg-white px-3 text-sm font-semibold leading-9 hover:bg-[#f8fafc]" href="/marketplace/orders/">
              Lịch sử đơn hàng
            </Link>
            <Link className="inline-flex h-9 items-center gap-2 rounded-md bg-[#2f7d32] px-3 text-sm font-extrabold text-white hover:bg-[#276a2a]" href="/marketplace/cart/">
              <ShoppingCart size={15} />
              Giỏ hàng
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[#dbe3dc] bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={17} />
            <input
              className="h-10 w-full rounded-md border border-transparent bg-[#f3f4f6] pl-10 pr-3 text-sm outline-none focus:border-[#16a34a] focus:bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              value={query}
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={14} />
            <select
              className="h-10 appearance-none rounded-md border border-[#dbe3dc] bg-white pl-9 pr-8 text-sm font-semibold outline-none"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#475569]" size={15} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#475569]">Tìm thấy {products.length} sản phẩm</p>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <article className="overflow-hidden rounded-lg border border-[#dbe3dc] bg-white shadow-sm" key={product.id}>
            <Link href={`/marketplace/products/${product.id}/`}>
              <img alt={product.name} className="h-[150px] w-full object-cover" src={product.image} />
            </Link>
            <div className="p-3">
              <span className="rounded bg-[#dcfce7] px-2 py-1 text-[11px] font-bold text-[#159447]">{product.category}</span>
              <h2 className="mt-2 line-clamp-1 text-base font-extrabold">{product.name}</h2>
              <p className="mt-3 min-h-[38px] text-sm leading-5 text-[#475569]">{product.description}</p>
              <p className="mt-3 text-xs text-[#64748b]">{product.supplier}</p>
              <p className="mt-3 text-xl font-extrabold text-[#159447]">
                {formatMoney(product.price)}
                <span className="text-xs font-medium text-[#475569]"> /{product.unit}</span>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="h-9 flex-1 rounded-md bg-[#2f7d32] text-sm font-extrabold text-white hover:bg-[#276a2a]"
                  onClick={() => router.push(`/marketplace/products/${product.id}/`)}
                  type="button"
                >
                  Xem chi tiết
                </button>
                <button
                  aria-label="Thêm vào giỏ"
                  className="flex h-9 w-10 items-center justify-center rounded-md border border-[#dbe3dc] bg-white hover:bg-[#f8fafc]"
                  onClick={() => add(product.id)}
                  type="button"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MarketplaceProductPage({ productId }: { productId: string }) {
  const router = useRouter();
  const { add, setCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = marketplaceProducts.find((item) => item.id === productId) ?? marketplaceProducts[0];
  const subtotal = product.price * quantity;

  function buyNow() {
    setCart([{ productId: product.id, quantity }]);
    router.push('/marketplace/checkout/');
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
      <BackButton href="/marketplace/" label="Quay lại Marketplace" />
      <div className="mt-3 rounded-lg border border-[#dbe3dc] bg-white">
        <div className="grid gap-5 p-4 lg:grid-cols-2">
          <div>
            <img alt={product.name} className="h-[290px] w-full rounded-md object-cover" src={product.image} />
            <div className="mt-3 flex gap-2">
              {product.thumbnails.map((thumb) => (
                <img alt={product.name} className="h-12 w-14 rounded border border-[#16a34a] object-cover" key={thumb} src={thumb} />
              ))}
            </div>
          </div>
          <div>
            <span className="rounded bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#159447]">{product.category}</span>
            <h1 className="mt-4 text-2xl font-extrabold">{product.name}</h1>
            <p className="mt-3 text-sm text-[#475569]">{product.description}</p>
            <div className="mt-4 rounded-md border border-[#dbe3dc] bg-[#f8fafc] p-3 text-sm">
              <p className="text-xs text-[#64748b]">Nhà cung cấp</p>
              <p className="font-extrabold">{product.supplier}</p>
            </div>
            <div className="mt-4 rounded-md border border-[#a7f3d0] bg-[#f0fdf4] p-4">
              <p className="text-3xl font-extrabold text-[#159447]">
                {formatMoney(product.price)} <span className="text-sm font-medium text-[#475569]">/{product.unit}</span>
              </p>
              <p className="mt-1 text-xs text-[#475569]">Còn hàng</p>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-bold">Số lượng</p>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded border border-[#dbe3dc]" onClick={() => setQuantity(Math.max(1, quantity - 1))} type="button">
                  <Minus size={14} />
                </button>
                <div className="flex h-9 w-16 items-center justify-center rounded bg-[#f1f5f9] text-sm font-extrabold">{quantity}</div>
                <button className="flex h-9 w-9 items-center justify-center rounded border border-[#dbe3dc]" onClick={() => setQuantity(quantity + 1)} type="button">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border border-[#dbe3dc] bg-[#f8fafc] p-4">
              <span className="text-sm text-[#475569]">Tạm tính:</span>
              <strong className="text-2xl text-[#159447]">{formatMoney(subtotal)}</strong>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#dbe3dc] bg-white text-sm font-bold" onClick={() => add(product.id, quantity)} type="button">
                <ShoppingCart size={15} />
                Thêm vào giỏ
              </button>
              <button className="h-10 rounded-md bg-[#2f7d32] text-sm font-extrabold text-white" onClick={buyNow} type="button">
                Mua ngay
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#dbe3dc] p-4">
          <h2 className="text-lg font-extrabold">Mô tả chi tiết</h2>
          <p className="mt-3 text-sm leading-6 text-[#334155]">
            {product.name} là sản phẩm phục vụ sản xuất nông nghiệp trong hệ thống Nextfarm. Sản phẩm được chọn lọc từ nhà cung cấp uy tín, phù hợp quy trình canh tác theo tiêu chuẩn an toàn và giúp nông trại chủ động vật tư theo mùa vụ.
          </p>
        </div>
      </div>
    </section>
  );
}

export function MarketplaceCartPage() {
  const { cart, setQuantity, remove } = useCart();
  const items = getCartItems(cart);

  if (!items.length) {
    return (
      <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
        <BackButton href="/marketplace/" label="Quay lại Marketplace" />
        <div className="mt-3 flex min-h-[210px] flex-col items-center justify-center rounded-lg border border-[#dbe3dc] bg-white text-center">
          <ShoppingCart className="text-[#9ca3af]" size={56} />
          <h1 className="mt-3 text-2xl font-extrabold">Giỏ hàng trống</h1>
          <p className="mt-2 text-sm text-[#475569]">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link className="mt-4 rounded-md bg-[#2f7d32] px-4 py-2 text-sm font-extrabold text-white" href="/marketplace/">
            Khám phá sản phẩm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
      <BackButton href="/marketplace/" label="Tiếp tục mua sắm" />
      <h1 className="mb-3 text-center text-2xl font-extrabold">Giỏ hàng của bạn</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_390px]">
        <div className="grid gap-3">
          {items.map((item) => (
            <article className="flex items-center gap-4 rounded-lg border border-[#dbe3dc] bg-white p-3" key={item.productId}>
              <img alt={item.product.name} className="h-20 w-20 rounded-md object-cover" src={item.product.image} />
              <div className="min-w-0 flex-1">
                <span className="rounded bg-[#dcfce7] px-2 py-1 text-[11px] font-bold text-[#159447]">{item.product.category}</span>
                <h2 className="mt-1 font-extrabold">{item.product.name}</h2>
                <p className="text-sm text-[#475569]">{formatMoney(item.product.price)} / {item.product.unit}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm">Số lượng:</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded border border-[#dbe3dc]" onClick={() => setQuantity(item.productId, item.quantity - 1)} type="button">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded border border-[#dbe3dc]" onClick={() => setQuantity(item.productId, item.quantity + 1)} type="button">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button className="mb-8 inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#fecaca] text-[#ef4444]" onClick={() => remove(item.productId)} type="button">
                  <Trash2 size={14} />
                </button>
                <p className="text-sm text-[#475569]">Thành tiền:</p>
                <p className="font-extrabold text-[#159447]">{formatMoney(item.subtotal)}</p>
              </div>
            </article>
          ))}
        </div>
        <SummaryCard
          action={
            <Link className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#2f7d32] text-sm font-extrabold text-white" href="/marketplace/checkout/">
              <ShoppingCart size={15} />
              Đặt hàng
            </Link>
          }
          cart={cart}
        />
      </div>
    </section>
  );
}

export function MarketplaceCheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const items = getCartItems(cart);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
      <BackButton href="/marketplace/cart/" label="Quay lại giỏ hàng" />
      <h1 className="mb-3 text-center text-2xl font-extrabold">Xác nhận đặt hàng</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_390px]">
        <div className="grid gap-3">
          <div className="rounded-lg border border-[#dbe3dc] bg-white p-4">
            <h2 className="text-lg font-extrabold">Thông tin người nhận</h2>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-2 text-sm font-bold">
                Tên người nhận *
                <input className="h-10 rounded-md border border-[#dbe3dc] bg-[#f3f4f6] px-3 font-medium outline-none focus:border-[#16a34a] focus:bg-white" defaultValue={confirmedOrder.receiver} />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Số điện thoại *
                <input className="h-10 rounded-md border border-[#dbe3dc] bg-[#f3f4f6] px-3 font-medium outline-none focus:border-[#16a34a] focus:bg-white" defaultValue={confirmedOrder.phone} />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Địa chỉ giao hàng *
                <textarea className="min-h-24 rounded-md border border-[#cbd5e1] px-3 py-2 font-medium outline-none focus:border-[#16a34a]" placeholder="Nhập địa chỉ chi tiết (số nhà, đường, xã/phường, huyện/quận, tỉnh/thành phố)" />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Ghi chú
                <textarea className="min-h-20 rounded-md border border-[#cbd5e1] px-3 py-2 font-medium outline-none focus:border-[#16a34a]" placeholder="Nhập ghi chú (nếu có)" />
              </label>
            </div>
          </div>
          <div className="rounded-lg border border-[#dbe3dc] bg-white p-4">
            <h2 className="text-lg font-extrabold">Sản phẩm đã đặt ({items.length} sản phẩm)</h2>
            <div className="mt-3 grid gap-3">
              {items.map((item) => (
                <div className="flex items-center gap-3 border-b border-[#e2e8f0] pb-3 last:border-b-0" key={item.productId}>
                  <img alt={item.product.name} className="h-14 w-14 rounded object-cover" src={item.product.image} />
                  <div className="flex-1">
                    <p className="font-extrabold">{item.product.name}</p>
                    <p className="text-sm text-[#475569]">{formatMoney(item.product.price)} / {item.product.unit}</p>
                    <p className="text-sm text-[#475569]">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#64748b]">Thành tiền</p>
                    <p className="font-extrabold text-[#159447]">{formatMoney(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SummaryCard
          action={
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#2f7d32] text-sm font-extrabold text-white" onClick={() => router.push('/marketplace/success/')} type="button">
              <Check size={15} />
              Xác nhận đặt hàng
            </button>
          }
          cart={cart}
        />
      </div>
    </section>
  );
}

export function MarketplaceSuccessPage() {
  const { cart, loaded, setCart } = useCart();
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);

  useEffect(() => {
    if (!loaded || order) return;

    const currentItems = getCartItems(cart);
    if (currentItems.length) {
      const createdOrder: MarketplaceOrder = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        date: new Intl.DateTimeFormat('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date()),
        receiver: confirmedOrder.receiver,
        phone: confirmedOrder.phone,
        address: confirmedOrder.address,
        status: 'Chờ xác nhận',
        lines: cart,
      };
      saveOrders([createdOrder, ...loadOrders()]);
      setOrder(createdOrder);
      setCart([]);
      return;
    }

    setOrder(loadOrders()[0] ?? null);
  }, [cart, loaded, order, setCart]);

  const shownItems = order ? getCartItems(order.lines) : [];
  const total = shownItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
      <div className="mx-auto max-w-[540px]">
        <div className="rounded-lg border border-[#86efac] bg-gradient-to-r from-[#ecfdf5] to-[#eff6ff] p-5 text-center">
          <Check className="mx-auto rounded-full border-4 border-[#16a34a] p-1 text-[#16a34a]" size={48} />
          <h1 className="mt-3 text-xl font-extrabold">Đặt hàng thành công!</h1>
          <p className="mt-1 text-sm text-[#475569]">Cảm ơn bạn đã đặt hàng tại Marketplace Nông nghiệp</p>
          <p className="mt-1 text-xs text-[#475569]">Mã đơn hàng: {order?.id ?? 'Đang tạo đơn hàng'}</p>
        </div>
        <div className="mt-3 rounded-lg border border-[#dbe3dc] bg-white p-4">
          <h2 className="font-extrabold">Thông tin đơn hàng</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <p><span className="block text-xs text-[#64748b]">Người nhận</span><strong>{order?.receiver ?? confirmedOrder.receiver}</strong></p>
            <p><span className="block text-xs text-[#64748b]">Ngày đặt hàng</span><strong>{order?.date ?? confirmedOrder.date}</strong></p>
            <p><span className="block text-xs text-[#64748b]">Số điện thoại</span><strong>{order?.phone ?? confirmedOrder.phone}</strong></p>
            <p className="rounded-md border border-[#86efac] bg-[#f0fdf4] p-3"><span className="block text-xs text-[#64748b]">Tổng tiền</span><strong className="text-lg text-[#159447]">{formatMoney(total)}</strong></p>
            <p><span className="block text-xs text-[#64748b]">Địa chỉ giao hàng</span><strong>{order?.address ?? confirmedOrder.address}</strong></p>
          </div>
          <div className="mt-4 border-t border-[#dbe3dc] pt-4">
            <h3 className="font-extrabold">Sản phẩm đã đặt ({shownItems.length} sản phẩm)</h3>
            <div className="mt-3 grid gap-2">
              {shownItems.map((item) => (
                <div className="flex items-center gap-3 rounded-md bg-[#f8fafc] p-2" key={item.productId}>
                  <img alt={item.product.name} className="h-12 w-12 rounded object-cover" src={item.product.image} />
                  <div className="flex-1">
                    <p className="text-sm font-extrabold">{item.product.name}</p>
                    <p className="text-xs text-[#475569]">{formatMoney(item.product.price)} / {item.product.unit} · SL: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-extrabold text-[#159447]">{formatMoney(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-4">
          <h2 className="font-extrabold">Bước tiếp theo</h2>
          <ul className="mt-2 grid gap-1 text-sm text-[#1d4ed8]">
            <li>Đơn hàng của bạn đã được gửi đến hệ thống Admin để xử lý</li>
            <li>Bạn sẽ nhận được cuộc gọi xác nhận trong vòng 24 giờ</li>
            <li>Theo dõi trạng thái đơn hàng tại mục Lịch sử đơn hàng</li>
          </ul>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Link className="rounded-md border border-[#dbe3dc] bg-white px-4 py-2 text-sm font-bold" href="/marketplace/">
            Tiếp tục mua sắm
          </Link>
          <Link className="rounded-md bg-[#2f7d32] px-4 py-2 text-sm font-extrabold text-white" href="/marketplace/orders/">
            Xem lịch sử đơn hàng
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MarketplaceOrdersPage() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  return (
    <section className="min-h-[calc(100vh-45px)] bg-[#f8fafc] p-3 text-[#0f172a]">
      <div className="rounded-lg border border-[#a7f3d0] bg-gradient-to-r from-[#ecfdf5] to-[#eff6ff] p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Lịch sử đơn hàng</h1>
            <p className="mt-1 text-sm text-[#475569]">Quản lý và theo dõi tất cả đơn hàng của bạn tại Marketplace</p>
          </div>
          <BackButton href="/marketplace/" label="Quay lại Marketplace" />
        </div>
      </div>

      {orders.length ? (
        <div className="mt-4 grid gap-4">
          {orders.map((order) => {
            const orderItems = getCartItems(order.lines);
            const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

            return (
              <article className="rounded-lg border border-[#dbe3dc] bg-white p-4" key={order.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold">Đơn hàng #{order.id}</h2>
                      <span className="rounded-full border border-[#facc15] bg-[#fef9c3] px-3 py-1 text-xs font-bold text-[#a16207]">{order.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#475569]">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#64748b]">Tổng tiền</p>
                    <p className="text-2xl font-extrabold text-[#159447]">{formatMoney(total)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-[#dbe3dc] pt-4">
                  <p className="mb-2 text-sm font-bold">{orderItems.length} sản phẩm:</p>
                  <div className="flex flex-wrap gap-3">
                    {orderItems.map((item) => (
                      <div className="flex items-center gap-2" key={item.productId}>
                        <img alt={item.product.name} className="h-12 w-12 rounded object-cover" src={item.product.image} />
                        <div>
                          <p className="text-xs font-bold">{item.product.name}</p>
                          <p className="text-xs text-[#475569]">SL: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#dbe3dc] pt-4 text-sm">
                  <p><span className="block text-xs text-[#64748b]">Người nhận</span><strong>{order.receiver} - {order.phone}</strong></p>
                  <p><span className="block text-xs text-[#64748b]">Địa chỉ giao hàng</span><strong>{order.address}</strong></p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button className="h-9 rounded-md border border-[#dbe3dc] bg-white text-sm font-bold" type="button">Xem chi tiết</button>
                  <button className="h-9 rounded-md border border-[#fecaca] bg-white text-sm font-bold text-[#ef4444]" type="button">Hủy đơn</button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-[#dbe3dc] bg-white text-center">
          <PackageCheck className="text-[#9ca3af]" size={56} />
          <h2 className="mt-3 text-2xl font-extrabold">Chưa có đơn hàng</h2>
          <p className="mt-2 max-w-[420px] text-sm text-[#475569]">
            Khi bạn đặt hàng thành công tại Marketplace, đơn hàng sẽ xuất hiện tại đây để theo dõi trạng thái xử lý.
          </p>
          <Link className="mt-4 rounded-md bg-[#2f7d32] px-4 py-2 text-sm font-extrabold text-white" href="/marketplace/">
            Khám phá sản phẩm
          </Link>
        </div>
      )}
    </section>
  );
}
