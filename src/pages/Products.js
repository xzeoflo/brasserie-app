import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Récupération des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error(error);
      } else {
        console.log('Catégories récupérées:', data);  // Test pour voir si les catégories sont bien récupérées
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // Récupération des produits en fonction de la catégorie sélectionnée
  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from('products').select('*');
      
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Liste des produits</h2>

      <select
        onChange={(e) => setSelectedCategory(e.target.value)}
        value={selectedCategory}
        style={{
          marginBottom: '20px',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid rgb(94 21 21)',
          backgroundColor: '#fff',
          color: '#333',
        }}
      >
        <option value="" style={{ color: '#333' }}>
          Toutes les catégories
        </option>
        {categories.length > 0 ? (
          categories.map((category) => (
            <option key={category.id} value={category.id} style={{ color: '#333' }}>
              {category.type} {/* Afficher le type(le nom) de la catégorie ici */}
            </option>
          ))
        ) : (
          <option disabled>Aucune catégorie disponible</option>
        )}
      </select>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.length === 0 ? (
          <p style={{ color: '#333' }}>Aucun produit trouvé pour cette catégorie.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                display: 'flex',
                margin: '20px',
                width: '300px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: '#fff',
                color: '#333',
                alignItems: 'center',
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  marginRight: '15px',
                }}
              />
              <div>
                <h3 style={{ color: '#333' }}>{product.name}</h3>
                <p style={{ color: '#555' }}>{product.description}</p>
                <p style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  Prix : {product.price}€
                </p>
                <Link to={`/products/${product.id}`} style={{ color: '#4caf50' }}>
                  Voir le produit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
