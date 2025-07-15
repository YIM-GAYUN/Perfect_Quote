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
  font-family: ${theme.fonts.korean.header};
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
  font-family: ${theme.fonts.korean.header};
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
    { label: "나를 위한 한마디", path: "/" },
    { label: "소개", path: "/about-overview", isDropdown: true },
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

  const [aboutDropdownOpen, setAboutDropdownOpen] = React.useState(false);
  const [ideaDropdownOpen, setIdeaDropdownOpen] = React.useState(false);
  const aboutDropdownRef = React.useRef<HTMLDivElement>(null);
  const ideaDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
      if (ideaDropdownRef.current && !ideaDropdownRef.current.contains(event.target as Node)) {
        setIdeaDropdownOpen(false);
      }
    }
    if (aboutDropdownOpen || ideaDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [aboutDropdownOpen, ideaDropdownOpen]);

  return (
    <HeaderContainer>
      <LogoSection onClick={handleLogoClick}>
        <img src={logoMain} alt="딱 맞는 말 로고" style={{ width: "51px", height: "51px" }} />
        <LogoText src={logoText} alt="딱 맞는 말" />
      </LogoSection>

      <Navigation>
        {navigationItems.map((item) => {
          if (item.label === "소개") {
            return (
              <div key={item.path} style={{ position: "relative" }} ref={aboutDropdownRef}>
                <NavItem
                  $isActive={isCurrentPath(item.path) || ["about-overview", "about-value", "about-analysis"].includes(currentPage)}
                  onClick={() => {
                    setAboutDropdownOpen((open) => !open);
                    setIdeaDropdownOpen(false);
                  }}
                  aria-haspopup="true"
                  aria-expanded={aboutDropdownOpen}
                >
                  {item.label}
                </NavItem>
                {aboutDropdownOpen && (
                  <DropdownMenu>
                    <DropdownItem onClick={() => { setAboutDropdownOpen(false); navigate("/about/overview"); }}>개요 및 철학</DropdownItem>
                    <DropdownItem onClick={() => { setAboutDropdownOpen(false); navigate("/about/value"); }}>핵심 가치</DropdownItem>
                   <DropdownItem onClick={() => { setAboutDropdownOpen(false); navigate("/about/analysis"); }}>분석 및 설계</DropdownItem>
                  </DropdownMenu>
                )}
              </div>
            );
          } else if (item.label === "아이디어") {
            return (
              <div key={item.path} style={{ position: "relative" }} ref={ideaDropdownRef}>
                <NavItem
                  $isActive={
                    item.label === '아이디어'
                      ? isCurrentPath(item.path) || currentPage === 'design-system' || currentPage === 'persona'
                      : isCurrentPath(item.path)
                  }
                  onClick={() => {
                    setIdeaDropdownOpen((open) => !open);
                    setAboutDropdownOpen(false);
                  }}
                  aria-haspopup="true"
                  aria-expanded={ideaDropdownOpen}
                >
                  {item.label}
                </NavItem>
                {ideaDropdownOpen && (
                  <DropdownMenu>
                    <DropdownItem onClick={() => { setIdeaDropdownOpen(false); navigate("/design-system"); }}>디자인 시스템</DropdownItem>
                    <DropdownItem onClick={() => { setIdeaDropdownOpen(false); navigate("/persona"); }}>페르소나</DropdownItem>
                  </DropdownMenu>
                )}
              </div>
            );
          } else {
            return (
              <NavItem
                key={item.path}
                $isActive={isCurrentPath(item.path)}
                onClick={() => handleNavClick(item.path)}
              >
                {item.label}
              </NavItem>
            );
          }
        })}
      </Navigation>
    </HeaderContainer>
  );

};

export default Header;
