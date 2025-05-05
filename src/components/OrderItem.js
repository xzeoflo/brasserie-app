import { supabase } from '../supabaseClient';

export default function OrderItem({ order, onMarkAsPickedUp }) {
  const handleMarkAsPickedUp = async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'picked_up' })
      .eq('id', order.id);

    if (error) console.error(error);
    else onMarkAsPickedUp(order.id);
  };

  return (
    <div className="order-item">
      <p>Client : {order.customer_name}</p>
      <p>Produits : {order.items_count}</p>
      <p>Total : {order.total_price}€</p>
      <button onClick={handleMarkAsPickedUp}>Récupérer</button>
    </div>
  );
}
