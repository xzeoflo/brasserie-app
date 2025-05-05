import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AddOrder() {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error(error);
      else setProducts(data);
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    const updatedItems = orderItems.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: parseInt(quantity) }
        : item
    );
    setOrderItems(updatedItems);
    updateTotals(updatedItems);
  };

  const handleAddItem = (productId) => {
    if (!orderItems.some((item) => item.product_id === productId)) {
      setOrderItems([...orderItems, { product_id: productId, quantity: 0 }]);
    }
  };

  const updateTotals = (items) => {
    let totalAmount = 0;
    let totalCount = 0;

    items.forEach((item) => {
      const product = products.find((prod) => prod.id === item.product_id);
      if (product) {
        totalAmount += product.price * item.quantity;
        totalCount += item.quantity;
      }
    });

    setTotalPrice(totalAmount);
    setTotalQuantity(totalCount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification de l'email pour récupérer l'ID du client
    if (customerEmail) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerEmail)
        .single();  // On récupère un seul utilisateur correspondant

      if (error || !userData) {
        console.error('Utilisateur non trouvé');
        return;
      }

      setCustomerId(userData.id); // On définit l'ID du client basé sur l'email
    } else {
      console.error('Email non renseigné');
      return;
    }

    // Si l'ID du client est valide
    if (customerId) {
      const { data, error } = await supabase.from('orders').insert([
        {
          customer_id: customerId,
          total_amount: totalPrice,
          status: 'pending',
          order_date: new Date().toISOString().split('T')[0],
        },
      ]);

      if (error) {
        console.error(error);
      } else {
        const orderId = data[0].id;
        const orderItemsData = orderItems.map((item) => ({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        const { error: itemError } = await supabase.from('order_item').insert(orderItemsData);

        if (itemError) {
          console.error(itemError);
        } else {
          navigate('/orders');
        }
      }
    }
  };

  return (
    <div>
      <h2>Ajouter une commande</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email du client</label>
          <input
            type="email"
            placeholder="Entrez l'email du client"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <h3>Produits</h3>
          {products.map((product) => (
            <div key={product.id} className="product-item">
              <p>{product.name} - {product.price}€</p>
              <input
                type="number"
                min="0"
                value={orderItems.find((item) => item.product_id === product.id)?.quantity || 0}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleAddItem(product.id)}
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
        <div className="totals">
          <p>Total produits : {totalQuantity}</p>
          <p>Prix total : {totalPrice}€</p>
        </div>
        <button type="submit">Passer la commande</button>
      </form>
    </div>
  );
}
