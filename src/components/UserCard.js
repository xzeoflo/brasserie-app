import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function UserCard({ user, onClose }) {
  const [editedUser, setEditedUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('users')
      .update({ name: editedUser.name, role: editedUser.role })
      .eq('id', editedUser.id);

    if (error) console.error(error);
    else {
      setIsEditing(false);
      onClose();
    }
  };

  return (
    <div className="user-card">
      <h3>{isEditing ? 'Modifier' : 'Détails'} de l'utilisateur</h3>
      <label>
        Nom
        <input
          type="text"
          name="name"
          value={editedUser.name}
          onChange={handleEditChange}
          disabled={!isEditing}
        />
      </label>
      <label>
        Rôle
        <select
          name="role"
          value={editedUser.role}
          onChange={handleEditChange}
          disabled={!isEditing}
        >
          <option value="">Aucun</option>
          <option value="employee">Employé</option>
          <option value="admin">Administrateur</option>
        </select>
      </label>
      {isEditing ? (
        <button onClick={handleSave}>Sauvegarder</button>
      ) : (
        <button onClick={() => setIsEditing(true)}>Modifier</button>
      )}
      <button onClick={onClose}>Fermer</button>
    </div>
  );
}
