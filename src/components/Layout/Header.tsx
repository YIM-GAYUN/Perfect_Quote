import React from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../../styles/theme";
import logoMain from "../../assets/logo-main.png";
import logoText from "../../assets/logo-text.png";


// 드롭다운 메뉴 스타일 (styled-components 상단에 위치)
const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.medium};
  min-width: 160px;
  padding: 0.5rem 0;
  margin: 0;
  z-index: 2000;
  list-style: none;
`;

const DropdownItem = styled.li`
  font-family: ${theme.fonts.korean.primary};
  font-size: ${theme.fontSizes.large};
  color: ${theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  text-align: center;
  &:hover {
    background: ${theme.colors.background.main};
    color: ${theme.colors.text.primary};
  }
`;

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
    { label: "아이디어", path: "/ideas", isDropdown: true },
    { label: "지원", path: "/support" },
  ];

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };
// (중복된 navigationItems 제거)
  const isCurrentPath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <HeaderContainer>
      <LogoSection onClick={handleLogoClick}>
        <LogoText src={logoText} alt="딱 맞는 말" />
      </LogoSection>

      <Navigation>
        {navigationItems.map((item) =>
          item.isDropdown ? (
            <div key={item.path} style={{ position: "relative" }} ref={dropdownRef}>
              <NavItem
                $isActive={
                  item.label === '아이디어'
                    ? isCurrentPath(item.path) || currentPage === 'design-system' || currentPage === 'persona'
                    : isCurrentPath(item.path)
                }
                onClick={() => setDropdownOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                {item.label}
              </NavItem>
              {dropdownOpen && (
                <DropdownMenu>
                  <DropdownItem onClick={() => { setDropdownOpen(false); navigate("/design-system"); }}>디자인 시스템</DropdownItem>
                  <DropdownItem onClick={() => { setDropdownOpen(false); navigate("/persona"); }}>페르소나</DropdownItem>
                </DropdownMenu>
              )}
            </div>
          ) : (
            <NavItem
              key={item.path}
              $isActive={isCurrentPath(item.path)}
              onClick={() => handleNavClick(item.path)}
            >
              {item.label}
            </NavItem>
          )
        )}
      </Navigation>
    </HeaderContainer>
  );

};

export default Header;
