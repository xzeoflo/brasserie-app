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
        `)
        .eq('status', 'pending');

      if (searchDate) {
        query = query.eq('order_date', searchDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setOrders([]);
        return;
      }

      // Filtrage côté client sur le nom complet (first_name ou last_name)
      let filteredData = data;
      if (searchName.trim() !== '') {
        const searchLower = searchName.toLowerCase();
        filteredData = filteredData.filter(order => {
          const firstName = order.users?.first_name?.toLowerCase() || '';
          const lastName = order.users?.last_name?.toLowerCase() || '';
          return firstName.includes(searchLower) || lastName.includes(searchLower);
        });
      }

      // Calcul du nombre total de produits par commande
      const updatedOrders = filteredData.map(order => {
        const totalQuantity = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        return { ...order, items_count: totalQuantity };
      });

      setOrders(updatedOrders);
    };

    fetchOrders();
  }, [searchName, searchDate]);

  const handleViewOrderDetail = (orderId) => {
    navigate(`/order-detail/${orderId}`);
  };

  const handleDeleteOrder = async (orderId) => {
    // Supprimer les order_items liés
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Erreur suppression order_items:', itemsError);
      return;
    }

    // Supprimer la commande
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Erreur suppression order:', error);
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

      <ul>
        {orders.map((order) => (
          <li
            key={order.id}
            style={{
              marginBottom: '20px',
              borderBottom: '1px solid #ccc',
              paddingBottom: '10px',
            }}
          >
            <p>
              Client :{' '}
              {order.users
                ? `${order.users.first_name} ${order.users.last_name}`
                : 'Client inconnu'}
            </p>
            <p>Date de commande : {new Date(order.order_date).toLocaleDateString('fr-FR')}</p>
            <p>Nombre de produits : {order.items_count}</p>
            <p>Total : {order.total_amount}€</p>

            <div className="order-buttons">
              <button
                onClick={() => handleViewOrderDetail(order.id)}
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
