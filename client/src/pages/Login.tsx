import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useAppUser } from '../context/UserContext';

const Wrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 40px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const H = styled.h1`
  margin: 0 0 8px;
  font-size: 1.5rem;
`;

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textDim};
  margin: 0 0 28px;
`;

const Btn = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radius};
  font-weight: 600;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: white; }
`;

const Err = styled.div`
  background: rgba(255, 92, 124, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const Login: React.FC = () => {
  const { signIn, isAuthenticated } = useAuth();
  const { user } = useAppUser();
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) nav('/dashboard', { replace: true });
  }, [isAuthenticated, user, nav]);

  return (
    <Wrap>
      <Card>
        <H>Welcome</H>
        <Sub>Sign in to continue to __PROJECT_DISPLAY__.</Sub>
        {params.get('denied') === '1' && (
          <Err>This email is not authorised. Ask an admin for access.</Err>
        )}
        <Btn onClick={() => signIn().catch(console.error)}>Continue with Google</Btn>
      </Card>
    </Wrap>
  );
};

export default Login;
