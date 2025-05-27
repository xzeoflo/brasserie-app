import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [modifiedData, setModifiedData] = useState({});
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const navigate = useNavigate();

  // Récupérer l'utilisateur courant et son rôle dans la table "users"
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Erreur auth:', error);
        return;
      }
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', user.id)
        .single();
      if (userError) {
        console.error('Erreur user table:', userError);
        return;
      }
      setCurrentUser({ ...user, role: userData.role });
    };
    fetchCurrentUser();
  }, []);

  // Charger les utilisateurs selon filtre, recherche et rôle
  useEffect(() => {
    const fetchUsers = async () => {
      let query = supabase.from('users').select('*');

      if (currentUser?.role === 'employee') {
        query = query.eq('role', '');
      }

      if (currentUser?.role === 'admin' && roleFilter !== '') {
        query = query.eq('role', roleFilter);
      }

      if (searchTerm) {
        query = query.ilike('last_name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) console.error(error);
      else setUsers(data);
    };
    if (currentUser) fetchUsers();
  }, [currentUser, roleFilter, searchTerm]);

  // Suppression d'un utilisateur
  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      if (error) {
        alert('Erreur lors de la suppression : ' + error.message);
        return;
      }
      setUsers(users.filter(u => u.id !== id));
      alert('Utilisateur supprimé avec succès.');
    } catch (err) {
      alert('Erreur inattendue : ' + err.message);
    }
  };

  // Passer en mode édition
  const handleEdit = (user) => {
    setEditingUser(user.id);
    setModifiedData({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    });
  };

  // Sauvegarder les modifications
  const handleSave = async (id) => {

    try {
      const { data, error } = await supabase
        .from('users')
        .update(modifiedData)
        .eq('id', id);
      if (error) {
        alert('Erreur lors de la modification : ' + error.message);
        return;
      }
      setUsers(users.map(u => (u.id === id ? { ...u, ...modifiedData } : u)));
      setEditingUser(null);
      alert('Utilisateur modifié avec succès.');
    } catch (err) {
      alert('Erreur inattendue : ' + err.message);
    }
  };

  // Changement dans le formulaire de modification
  const handleChange = (e) => {
    const { name, value } = e.target;
    setModifiedData(prev => ({ ...prev, [name]: value }));
  };

  // Changement dans le formulaire de création
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  // Création d'un nouvel utilisateur : déconnecte et renvoie au login
  const handleCreateUser = async () => {
    const roleToSet = currentUser.role === 'employee' ? '' : newUser.role;

    if (!newUser.email || !newUser.password) {
      alert("Email et mot de passe sont obligatoires.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    });

    if (error) {
      alert('Erreur : ' + error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      alert('Erreur lors de la création du compte utilisateur.');
      return;
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: roleToSet,
      });

    if (insertError) {
      alert('Erreur lors de la création de l’utilisateur : ' + insertError.message);
      return;
    }

    // Déconnexion après création
    await supabase.auth.signOut();

    alert('Utilisateur créé avec succès. Veuillez vous reconnecter.');

    navigate('/login');
    window.location.reload();
  };

  return (
    <div>
      <h2>Utilisateurs</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        {currentUser?.role === 'admin' && (
          <>
            <label>Filtrer par rôle :</label>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">Clients (sans rôle)</option>
              <option value="employee">Employés</option>
              <option value="admin">Admins</option>
            </select>
          </>
        )}

        <input
          type="text"
          placeholder="Nom de famille"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '4px 8px', width: '200px' }}
        />

        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Annuler' : 'Ajouter un utilisateur'}
        </button>
      </div>

      {showCreateForm && (
        <div style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <input
            name="email"
            value={newUser.email}
            onChange={handleNewUserChange}
            placeholder="Email"
          />
          <input
            name="password"
            type="password"
            value={newUser.password}
            onChange={handleNewUserChange}
            placeholder="Mot de passe"
          />
          <input
            name="first_name"
            value={newUser.first_name}
            onChange={handleNewUserChange}
            placeholder="Prénom"
          />
          <input
            name="last_name"
            value={newUser.last_name}
            onChange={handleNewUserChange}
            placeholder="Nom"
          />
          {currentUser?.role === 'admin' && (
            <select name="role" value={newUser.role} onChange={handleNewUserChange}>
              <option value="">Client</option>
              <option value="employee">Employé</option>
              <option value="admin">Admin</option>
            </select>
          )}
          <button onClick={handleCreateUser}>Créer</button>
        </div>
      )}

      <ul>
        {users.map(user => (
          <li key={user.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
            {editingUser === user.id ? (
              <div>
                <input
                  type="text"
                  name="first_name"
                  value={modifiedData.first_name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="last_name"
                  value={modifiedData.last_name}
                  onChange={handleChange}
                />
                {currentUser?.role === 'admin' && (
                  <select name="role" value={modifiedData.role} onChange={handleChange}>
                    <option value="">Client</option>
                    <option value="employee">Employé</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
                <button onClick={() => handleSave(user.id)}>Sauvegarder</button>
                <button onClick={() => setEditingUser(null)}>Annuler</button>
              </div>
            ) : (
              <>
                <p>
                  {user.first_name} {user.last_name} — {user.role || 'Client'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(user)}>Modifier</button>
                  <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
