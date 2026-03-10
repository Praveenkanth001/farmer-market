import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function CartPage() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const updateItems = (next) => {
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const changeQty = (id, delta) => {
    const next = items.map((it) =>
      it._id === id
        ? { ...it, quantityKg: Math.max(1, it.quantityKg + delta) }
        : it
    );
    updateItems(next);
  };

  const removeItem = (id) => {
    const next = items.filter((it) => it._id !== id);
    updateItems(next);
  };

  const subtotal = items.reduce(
    (sum, it) => sum + it.pricePerKg * it.quantityKg,
    0
  );
  const delivery = items.length ? 50 : 0;
  const total = subtotal + delivery;

  const placeOrder = () => {
    if (!items.length) return;

    const addressInput = document.getElementById('delivery-address');
    const address = addressInput ? addressInput.value : '';
    if (!address.trim()) {
      alert('Please enter delivery address');
      return;
    }

    const order = {
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      items,
      total,
      address,
    };

    const stored = localStorage.getItem('orders');
    const current = stored ? JSON.parse(stored) : [];
    current.push(order);
    localStorage.setItem('orders', JSON.stringify(current));

    localStorage.removeItem('cart');
    setItems([]);
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* left: items */}
        <section>
          <h1 className="text-xl font-semibold text-emerald-900 mb-4">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <p className="text-sm text-emerald-900/70">
              Your cart is empty. Add some products from the marketplace.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="bg-white rounded-2xl border border-emerald-100 p-4 flex items-center gap-4 justify-between"
                >
                  <div className="h-16 w-16 rounded-xl bg-emerald-100 flex items-center justify-center text-xs text-emerald-500">
                    No image
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900">
                      {it.name}
                    </p>
                    <p className="text-xs text-emerald-900/70">
                      ₹{it.pricePerKg} per kg
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(it._id, -1)}
                      className="h-7 w-7 rounded-full border border-emerald-200 flex items-center justify-center text-sm"
                    >
                      –
                    </button>
                    <span className="text-sm">{it.quantityKg}</span>
                    <button
                      onClick={() => changeQty(it._id, 1)}
                      className="h-7 w-7 rounded-full border border-emerald-200 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => removeItem(it._id)}
                      className="text-xs text-red-500"
                    >
                      🗑
                    </button>
                    <p className="text-sm font-semibold text-emerald-900">
                      ₹{it.pricePerKg * it.quantityKg}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* right: summary */}
        <aside className="bg-white rounded-2xl border border-emerald-100 p-4 h-fit">
          <h2 className="text-sm font-semibold text-emerald-900 mb-4">
            Order Summary
          </h2>

          <div className="space-y-2 text-sm text-emerald-900/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>₹{delivery}</span>
            </div>
          </div>

          <hr className="my-3 border-emerald-100" />

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-emerald-900">
              Total
            </span>
            <span className="text-lg font-semibold text-emerald-900">
              ₹{total}
            </span>
          </div>

          <div className="mb-3">
            <p className="text-xs font-semibold text-emerald-900 mb-1">
              Delivery Address
            </p>
            <textarea
              id="delivery-address"
              rows={3}
              placeholder="Enter your full delivery address..."
              className="w-full text-xs rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={placeOrder}
            className="w-full py-2.5 rounded-full bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 mb-2"
          >
            Place Order
          </button>

          <button
            onClick={() => navigate('/market')}
            className="w-full py-2 rounded-full border border-emerald-200 text-xs text-emerald-800 hover:bg-emerald-50"
          >
            Back
          </button>
        </aside>
      </main>
    </div>
  );
}

export default CartPage;
