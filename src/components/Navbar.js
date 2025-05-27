import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUserDetails = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('id', user.id)
          .single();

        if (!userError && userData) {
          setRole(userData.role);
          setUsername(`${userData.first_name} ${userData.last_name}`);
        } else {
          console.error(userError);
        }
      }
    };
    getUserDetails();
  }, []);

  const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate('/');
  window.location.reload(); 
};


  return (
    <nav className="navbar">
      <div className="navbar-container">
      <div className="navbar-logo">
        <img src="/images/brasserie_logo.png" alt="Logo Brasserie" />
      </div>



        <div className="navbar-links">
          <a href="/" className="navbar-link">Accueil</a>
          <a href="/products" className="navbar-link">Produits</a>
          {(role === 'admin' || role === 'employee') && (
            <a href="/orders" className="navbar-link">Commandes</a>
          )}
          {(role === 'admin' || role === 'employee') && (
            <a href="/users" className="navbar-link">Utilisateurs</a>
          )}
          {username && (
            <div className="navbar-user">
              <span className="navbar-username">Bienvenue, {username}</span>
              <button className="navbar-button" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          )}
          {!username && <a href="/login" className="navbar-link">Connexion</a>}
        </div>
      </div>
    </nav>
  );
}
