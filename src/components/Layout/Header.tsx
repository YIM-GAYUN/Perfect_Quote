import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../../styles/theme";
import logoMain from "../../assets/logo-main.png";
import logoText from "../../assets/logo-text.png";

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 130px;
  background-color: ${theme.colors.secondary};
  box-shadow: ${theme.shadows.medium};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${theme.spacing.xxl};

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 0 ${theme.spacing.md};
    height: 80px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
`;

const LogoIcon = styled.img`
  width: 51px;
  height: 51px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    width: 35px;
    height: 35px;
  }
`;

const LogoText = styled.img`
  height: 42px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    height: 30px;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.mobile}) {
    gap: ${theme.spacing.md};
  }
`;

const NavItem = styled.button<{ $isActive: boolean }>`
  background: none;
  font-family: ${theme.fonts.korean.primary};
  font-size: ${theme.fontSizes.large};
  color: ${(props) => (props.$isActive ? theme.colors.text.primary : theme.colors.text.secondary)};
  font-weight: ${(props) => (props.$isActive ? 600 : 400)};
  transition: color 0.3s ease;

  &:hover {
    color: ${theme.colors.text.primary};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: ${theme.fontSizes.medium};
  }
`;

interface HeaderProps {
  currentPage?: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage = "quote-generator" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { label: "소개", path: "/about" },
    { label: "나를 위한 한마디", path: "/" },
    { label: "아이디어", path: "/ideas" },
    { label: "지원", path: "/support" },
  ];

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <HeaderContainer>
      <LogoSection onClick={handleLogoClick}>
        <LogoIcon src={logoMain} alt="딱 맞는 말 로고" />
        <LogoText src={logoText} alt="딱 맞는 말" />
      </LogoSection>

      <Navigation>
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            $isActive={isCurrentPath(item.path)}
            onClick={() => handleNavClick(item.path)}
          >
            {item.label}
          </NavItem>
        ))}
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;
