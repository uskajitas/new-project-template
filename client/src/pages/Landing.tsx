import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Hero = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  text-align: center;
  background:
    radial-gradient(circle at 30% 20%, rgba(124,92,255,0.18), transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(92,255,176,0.10), transparent 50%),
    ${({ theme }) => theme.colors.bg};
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  margin: 0 0 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Sub = styled.p`
  font-size: 1.1rem;
  max-width: 560px;
  color: ${({ theme }) => theme.colors.textDim};
  margin: 0 0 32px;
`;

const CTA = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.radius};
  font-weight: 600;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    color: white;
  }
`;

const Landing: React.FC = () => (
  <Hero>
    <Title>__PROJECT_DISPLAY__</Title>
    <Sub>Replace this hero copy with what __PROJECT_DISPLAY__ actually does.</Sub>
    <CTA to="/login">Sign in</CTA>
  </Hero>
);

export default Landing;
