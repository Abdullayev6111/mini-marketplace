import { useEffect, useState } from 'react';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.title} />
      <div className="cart-item-info">
        <div className="cart-item-category">{item.category}</div>
        <h4 className="cart-item-title">{item.title}</h4>
        <div className="cart-controls">
          <div className="quantity-counter">
            <button className="quantity-btn" onClick={() => onUpdateQuantity(item.id, -1)}>
              -
            </button>
            <span className="quantity-value">{item.quantity || 1}</span>
            <button className="quantity-btn" onClick={() => onUpdateQuantity(item.id, 1)}>
              +
            </button>
          </div>
          <span className="remove-text" onClick={() => onRemove(item.id)}>
            O'chirish
          </span>
        </div>

        <p style={{ fontWeight: 600, marginTop: 8 }}>
          Narxi: {(item.price * (item.quantity || 1)).toFixed(2)} $
        </p>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cart, setCart] = useState([]);

  const loadCart = () => {
    const data = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(data);
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const removeItem = (id) => {
    const newCart = cart.filter((i) => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQuantity = (id, delta) => {
    const newCart = cart.map((item) => {
      if (item.id === id) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const totalItems = cart.length;
  const subtotal = cart.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
  const discount = subtotal * 0.1;
  const totalPrice = (subtotal - discount).toFixed(2);

  if (cart.length === 0) {
    return <div className="cart-section empty-cart">Savat bo'sh</div>;
  }

  return (
    <div className="cart-section">
      <h2 className="cart-title">Savatgiz, {totalItems} mahsulot</h2>

      {cart.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={removeItem}
          onUpdateQuantity={updateQuantity}
        />
      ))}

      <div className="cart-summary">
        <div className="summary-row">
          <span>Mahsulotlar ({totalItems}):</span>
          <span>{subtotal.toFixed(2)} $</span>
        </div>

        <div className="summary-row shipping">
          <span>Tejovingiz (10%):</span>
          <span>-{discount.toFixed(2)} $</span>
        </div>

        <div className="summary-row total">
          <span>Jami:</span>
          <span>{totalPrice} $</span>
        </div>

        <button className="checkout-btn">Rasmiylashtirishga o'tish</button>
      </div>
    </div>
  );
};

export default Cart;
