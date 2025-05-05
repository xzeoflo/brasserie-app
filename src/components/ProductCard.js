import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image_url} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>Prix : {product.price}€</p>
      <Link to={`/products/${product.id}`}>Voir le produit</Link>
    </div>
  );
}
