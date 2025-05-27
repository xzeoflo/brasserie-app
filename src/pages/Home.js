import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);

  // Récupération des 5 derniers produits ajoutés grâce à leur ID.
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  // Configuration du carrousel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Bienvenue à la Brasserie</h1>
      <p style={{ marginBottom: '30px' }}>Découvrez nos produits fraîchement ajoutés!</p>

      <h2 style={{ marginBottom: '20px' }}>Nos derniers produits :</h2>

      {products.length === 0 ? (
        <p>Aucun produit disponible</p>
      ) : (
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product.id} style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  marginBottom: '10px',
                }}
              />
              <h3 style={{ marginBottom: '10px' }}>{product.name}</h3>
              <p style={{ marginBottom: '15px' }}>{product.price}€</p>
              <Link to={`/products/${product.id}`} style={{ marginTop: '10px' }}>Voir le produit</Link>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}
