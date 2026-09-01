import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingButtons from './components/layout/FloatingButtons';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthPage from './components/auth/AuthPage';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import ProductForm from './pages/admin/ProductForm';
import OrderManager from './pages/admin/OrderManager';
import ReviewManager from './pages/admin/ReviewManager';
import AdminReferrals from './pages/admin/Referrals';
import PWAInstall from './components/common/PWAInstall';

// Styles
import './index.css';
import './styles/components.css';
import './styles/admin.css';

function App() {
  return (
    <AuthProvider>
      <CustomerProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: '#1a1a2e',
                  color: '#f0f0f5',
                  border: '1px solid #2d2d50',
                  borderRadius: '10px',
                },
                success: {
                  iconTheme: { primary: '#e2b04a', secondary: '#1a1a2e' },
                },
              }}
            />
            <PWAInstall />
            <Routes>
              {/* Customer Routes */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <Home />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/catalog"
                element={
                  <>
                    <Navbar />
                    <Catalog />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <>
                    <Navbar />
                    <ProductDetail />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/cart"
                element={
                  <>
                    <Navbar />
                    <Cart />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/checkout"
                element={
                  <>
                    <Navbar />
                    <Checkout />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/order-confirmation"
                element={
                  <>
                    <Navbar />
                    <OrderConfirmation />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <>
                    <Navbar />
                    <Wishlist />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route
                path="/account"
                element={
                  <>
                    <Navbar />
                    <Account />
                    <Footer />
                    <FloatingButtons />
                  </>
                }
              />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/login/:mode" element={<AuthPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductManager />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="orders" element={<OrderManager />} />
                <Route path="reviews" element={<ReviewManager />} />
                <Route path="referrals" element={<AdminReferrals />} />
              </Route>
            </Routes>
          </Router>
          </WishlistProvider>
        </CartProvider>
      </CustomerProvider>
    </AuthProvider>
  );
}

export default App;
