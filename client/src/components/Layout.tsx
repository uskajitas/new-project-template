import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';

const Shell = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
`;

const Side = styled.aside`
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Brand = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  padding: 8px 12px 20px;
  color: ${({ theme }) => theme.colors.text};
`;

const Item = styled(NavLink)`
  display: block;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.colors.textDim};
  font-weight: 500;
  &.active {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Bottom = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textDim};
`;

const SignOutBtn = styled.button`
  margin-top: 8px;
  padding: 6px 10px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.colors.textDim};
  cursor: pointer;
  font-size: 0.85rem;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Main = styled.main`
  padding: 28px 36px;
  overflow: auto;
`;

const Layout: React.FC = () => {
  const { user, isAdmin } = useAppUser();
  const { signOut } = useAuth();
  const nav = useNavigate();

  return (
    <Shell>
      <Side>
        <Brand>__PROJECT_DISPLAY__</Brand>
        <Item to="/dashboard">Dashboard</Item>
        {isAdmin && <Item to="/users">Users</Item>}
        <Bottom>
          <div>{user?.email}</div>
          <div style={{ opacity: 0.7 }}>role: {user?.role}</div>
          <SignOutBtn onClick={async () => { await signOut(); nav('/'); }}>Sign out</SignOutBtn>
        </Bottom>
      </Side>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
};

export default Layout;
