import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } else {
        console.log(data); 
        setProduct(data);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p>Chargement...</p>;

  return (
    <div className="product-detail-container" style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="product-image" style={{ flex: 1 }}>
        <img
          src={product.image_url}
          alt={product.name}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      {/* Détails à droite */}
      <div className="product-details" style={{ flex: 2, maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>{product.name}</h1>
        <p style={{ fontSize: '1rem', color: '#555', marginBottom: '1rem' }}>{product.description}</p>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Prix : {product.price}€</p>
        
        {/* Vérification de la quantité disponible */}
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Quantité disponible : {product.quantity || 'Non spécifiée'}
        </p>
      </div>
    </div>
  );
}
