import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Login from './pages/Login';
import AddOrder from './pages/AddOrder';
import DetailOrder from './pages/DetailOrder'

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/order-detail/:id" element={<DetailOrder />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;
