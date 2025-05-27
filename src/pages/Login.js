import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Connexion avec Supabase
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Vérification du rôle
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      setError("Impossible de récupérer les informations de l'utilisateur.");
      await supabase.auth.signOut(); // Déconnexion si erreur
      return;
    }

    const allowedRoles = ['admin', 'employee'];

    if (!allowedRoles.includes(userData.role)) {
      setError("Accès refusé. Votre rôle ne vous permet pas de vous connecter.");
      await supabase.auth.signOut(); // Déconnexion si rôle non autorisé
      return;
    }

    // Connexion autorisée : rediriger + reload
    navigate('/');
    window.location.reload();
  };

  return (
    <div>
      <h1>Connexion</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
