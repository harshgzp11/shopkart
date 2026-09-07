import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="product-card glass-panel">
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="stock-badge low-stock">Only {product.stock} left!</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
        <button 
          className="btn-primary view-details-btn"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
