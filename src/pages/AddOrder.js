import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AddOrder() {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [customerEmail, setCustomerEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error(error);
        setErrorMsg('Erreur lors de la récupération des produits.');
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 0) quantity = 0;

    let found = false;
    const updatedItems = orderItems.map((item) => {
      if (item.product_id === productId) {
        found = true;
        return { ...item, quantity: parseInt(quantity) || 0 };
      }
      return item;
    });
    if (!found) {
      updatedItems.push({ product_id: productId, quantity: parseInt(quantity) || 0 });
    }
    setOrderItems(updatedItems);
    updateTotals(updatedItems);
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

  const validateOrder = () => {
    if (!customerEmail.trim()) {
      setErrorMsg('Veuillez saisir l’email du client.');
      return false;
    }

    if (orderItems.length === 0 || orderItems.every(item => item.quantity <= 0)) {
      setErrorMsg('Veuillez ajouter au moins un produit avec une quantité positive.');
      return false;
    }

    for (const item of orderItems) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        setErrorMsg(`Produit avec id ${item.product_id} non trouvé.`);
        return false;
      }
      if (item.quantity > product.quantity) {
        setErrorMsg(`Quantité demandée (${item.quantity}) dépasse le stock disponible (${product.quantity}) pour le produit ${product.name}.`);
        return false;
      }
    }

    setErrorMsg('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOrder()) return;

    // Récupérer l'ID client via email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (userError || !userData) {
      setErrorMsg('Client non trouvé avec cet email.');
      return;
    }

    // Créer la commande avec récupération de la ligne insérée
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: userData.id,
          total_amount: totalPrice,
          status: 'pending',
          order_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select();

    if (error) {
      setErrorMsg('Erreur lors de la création de la commande.');
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      setErrorMsg('Erreur : la commande n’a pas été créée correctement.');
      return;
    }

    const orderId = data[0].id;

    // Préparer les items de la commande
    const orderItemsData = orderItems
      .filter(item => item.quantity > 0)
      .map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

    const { error: itemError } = await supabase.from('order_items').insert(orderItemsData);

    if (itemError) {
      setErrorMsg('Erreur lors de l’ajout des produits à la commande.');
      console.error(itemError);
      return;
    }

    // Mise à jour des quantités dans products
    for (const item of orderItemsData) {
      const { data: productData, error: prodError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      if (prodError) {
        console.error('Erreur récupération produit:', prodError);
        continue;
      }

      const newQuantity = productData.quantity - item.quantity;
      if (newQuantity < 0) {
        console.warn(`Quantité insuffisante pour le produit ${item.product_id}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', item.product_id);

      if (updateError) {
        console.error('Erreur mise à jour quantité produit:', updateError);
      }
    }

    // Tout est OK, redirection
    navigate('/orders');
  };

  return (
    <div>
      <h2>Ajouter une commande</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
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
          {products.map((product) => {
            const currentQuantity = orderItems.find((item) => item.product_id === product.id)?.quantity || 0;
            return (
              <div key={product.id} className="product-item" style={{ marginBottom: '10px' }}>
                <p>
                  {product.name} - {product.price}€ - Stock disponible : {product.quantity}
                </p>
                <input
                  type="number"
                  min="0"
                  max={product.quantity}
                  value={currentQuantity}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  style={{ width: '60px' }}
                />
              </div>
            );
          })}
        </div>
        <div className="totals" style={{ marginTop: '15px' }}>
          <p>Total produits : {totalQuantity}</p>
          <p>Prix total : {totalPrice.toFixed(2)}€</p>
        </div>
        <button type="submit">Passer la commande</button>
      </form>
    </div>
  );
}
