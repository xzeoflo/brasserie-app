import { useState } from 'react';
import { supabase } from '../supabaseClient';
import UserCard from './UserCard';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('name', `%${search}%`);

    if (error) console.error(error);
    else setUsers(data);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Rechercher par nom"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={fetchUsers}>Rechercher</button>
      
      <div>
        {users.map((user) => (
          <div key={user.id} onClick={() => setSelectedUser(user)}>
            <p>{user.name} - {user.role}</p>
          </div>
        ))}
      </div>

      {selectedUser && (
        <UserCard user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
