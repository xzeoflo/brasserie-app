import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function DetailOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_date,
          total_amount,
          status,
          users (
            first_name,
            last_name
          ),
          order_items (
            quantity,
            product_id,
            products (
              name,
              image_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur récupération commande :', error);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleMarkAsCompleted = async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la mise à jour :', error);
    } else {
      alert('Commande marquée comme récupérée.');
      navigate(-1);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Chargement...</p>;
  if (!order) return <p style={{ padding: '20px' }}>Commande introuvable.</p>;

  return (
    <div style={{
      padding: '32px',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#333',
          fontSize: '18px',
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        ← Retour
      </button>

      <div style={{ fontSize: '18px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
        <p><strong>Client :</strong> {order.users ? `${order.users.first_name} ${order.users.last_name}` : 'Inconnu'}</p>
        <p><strong>Date :</strong> {order.order_date}</p>
        <p><strong>Total :</strong> {order.total_amount} €</p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '16px' }}>Produits</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {order.order_items?.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              {item.products?.image_url && (
                <img
                  src={item.products.image_url}
                  alt={item.products.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginRight: '16px'
                  }}
                />
              )}
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{item.products?.name || 'Produit inconnu'}</p>
                <p style={{ margin: 0 }}>Quantité : {item.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleMarkAsCompleted}
        style={{
          width: '100%',
          backgroundColor: 'green',
          color: 'white',
          padding: '16px',
          fontSize: '18px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Récupéré
      </button>
    </div>
  );
}
