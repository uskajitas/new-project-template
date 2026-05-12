import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api';
import type { AppUser, Role } from '../context/UserContext';

const H = styled.h1`
  margin: 0 0 8px;
  font-size: 1.7rem;
`;

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textDim};
  margin: 0 0 24px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  overflow: hidden;
  th, td {
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 0.92rem;
  }
  th {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.textDim};
    font-weight: 600;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  tr:last-child td { border-bottom: none; }
`;

const Select = styled.select`
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 4px 8px;
`;

const DangerBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radius};
  padding: 4px 10px;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.danger}; color: white; }
`;

const AddRow = styled.div`
  display: flex;
  gap: 8px;
  margin: 16px 0 24px;
`;

const Input = styled.input`
  flex: 1;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 8px 12px;
`;

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: 0;
  border-radius: ${({ theme }) => theme.radius};
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

const Users: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState<Role>('guest');
  const [busy, setBusy]   = useState(false);

  async function load() {
    const list = await api.get<AppUser[]>('/api/users');
    setUsers(list);
  }

  useEffect(() => { load().catch(console.error); }, []);

  async function setUserRole(em: string, r: Role) {
    setBusy(true);
    try {
      await api.put(`/api/users/${encodeURIComponent(em)}`, { role: r });
      await load();
    } finally { setBusy(false); }
  }

  async function addUser() {
    if (!email.trim()) return;
    setBusy(true);
    try {
      await api.post('/api/users', { email: email.trim().toLowerCase(), role });
      setEmail('');
      setRole('guest');
      await load();
    } finally { setBusy(false); }
  }

  async function removeUser(em: string) {
    if (!confirm(`Remove ${em}?`)) return;
    setBusy(true);
    try {
      await api.del(`/api/users/${encodeURIComponent(em)}`);
      await load();
    } finally { setBusy(false); }
  }

  return (
    <>
      <H>Users</H>
      <Sub>Add or remove users and change their roles. Roles: admin / pro / guest.</Sub>

      <AddRow>
        <Input
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="guest">guest</option>
          <option value="pro">pro</option>
          <option value="admin">admin</option>
        </Select>
        <PrimaryBtn disabled={busy} onClick={addUser}>Add user</PrimaryBtn>
      </AddRow>

      <Table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Last login</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td>{u.email}</td>
              <td>{u.name || '—'}</td>
              <td>
                <Select
                  value={u.role}
                  disabled={busy}
                  onChange={(e) => setUserRole(u.email, e.target.value as Role)}
                >
                  <option value="guest">guest</option>
                  <option value="pro">pro</option>
                  <option value="admin">admin</option>
                </Select>
              </td>
              <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}</td>
              <td><DangerBtn disabled={busy} onClick={() => removeUser(u.email)}>Remove</DangerBtn></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default Users;
