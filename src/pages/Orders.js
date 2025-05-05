import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_date,
          status,
          total_amount,
          customer_id,
          order_items (
            quantity,
            product_id
          ),
          users (
            first_name,
            last_name
          )
        `);

      // Apply name search filter
      if (searchName) {
        query = query.ilike('users.first_name', `%${searchName}%`)
                     .or(`users.last_name.ilike.%${searchName}%`);
      }

      // Apply date search filter
      if (searchDate) {
        query = query.eq('order_date', searchDate);  // Utilisation correcte de searchDate
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
      } else {
        console.log('Fetched Orders:', data); // Vérification des données récupérées

        // Vérification des order_items
        data.forEach((order) => {
          console.log('Order items for order ID', order.id, order.order_items);
        });

        // Calculer la quantité totale de produits par commande
        const updatedOrders = data.map(order => {
          // Vérifier si order_items est défini et contient des éléments
          if (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0) {
            const totalQuantity = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
            return { ...order, items_count: totalQuantity };
          } else {
            console.log(`Aucun produit trouvé pour la commande ID ${order.id}`); // Log pour debug
            return { ...order, items_count: 0 }; // Aucun produit dans cette commande
          }
        });

        setOrders(updatedOrders);
      }
    };

    fetchOrders();
  }, [searchName, searchDate]);

  const handleMarkAsPickedUp = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'picked_up' })
      .eq('id', orderId);

    if (error) {
      console.error(error);
    } else {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error(error);
    } else {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const handleAddOrder = () => {
    navigate('/add-order');
  };

  return (
    <div>
      <h2>Commandes</h2>

      {/* Filters and Add Order Button */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher par nom"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="filter-input"
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="filter-input"
        />
        <button onClick={handleAddOrder} className="add-order-button">
          Ajouter une commande
        </button>
      </div>

      {/* Orders List */}
      <ul>
        {orders.map((order) => (
          <li key={order.id} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <p>Client : {order.users ? `${order.users.first_name} ${order.users.last_name}` : 'Client inconnu'}</p>
            <p>Nombre de produits : {order.items_count}</p>
            <p>Total : {order.total_amount}€</p>

            {/* Buttons for each order */}
            <div className="order-buttons">
              <button
                onClick={() => handleMarkAsPickedUp(order.id)}
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  padding: '5px 10px',
                  marginRight: '10px',
                }}
              >
                Récupérer
              </button>
              <button
                onClick={() => handleDeleteOrder(order.id)}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '5px 10px',
                }}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
