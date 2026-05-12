import React from 'react';
import styled from 'styled-components';
import { useAppUser } from '../context/UserContext';

const H = styled.h1`
  margin: 0 0 8px;
  font-size: 1.7rem;
`;

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.textDim};
  margin: 0 0 24px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  padding: 20px;
  max-width: 520px;
`;

const Dashboard: React.FC = () => {
  const { user } = useAppUser();
  return (
    <>
      <H>Dashboard</H>
      <Sub>Welcome back, {user?.name || user?.email}.</Sub>
      <Card>
        <div>This is your placeholder dashboard. Replace with the real feature.</div>
      </Card>
    </>
  );
};

export default Dashboard;
