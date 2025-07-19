export const theme = {
  colors: {
    primary: "#6490FF", // 메인 블루
    highlight: "rgba(108, 141, 212, 0.2)", // 하이라이트 블루
    secondary: "#FFFFFF", // 화이트
    text: {
      primary: "#4A4E57", // 메인 텍스트
      secondary: "#9C9C9C", // 보조 텍스트
      dark: "#303030", // 다크 텍스트
    },
    background: {
      main: "#FFFFFF",
      light: "#EFEFEF",
      overlay: "rgba(87, 253, 228, 0.1)",
    },
    border: {
      light: "#EAF0FF",
      primary: "#6490FF",
    },
    chat: {
      user: "#6490FF",
      bot: "#FFFFFF",
      input: "#EFEFEF",
    },
  },
  fonts: {
    korean: {
      primary: "Freesentation-4Regular, system-ui, sans-serif",
      title: "Freesentation-5Medium, system-ui, sans-serif",
      light: "Freesentation-3Light, system-ui, sans-serif",
      bold: "Freesentation-7Bold, system-ui, sans-serif",
      header: "a시월구일1, 시월구일, KoreanSWGI, SWGI, system-ui, sans-serif",
      chatbot: "Pretendard-Regular, system-ui, sans-serif",
    },
    english: {
      primary: "Pretendard, system-ui, sans-serif",
      mono: "ABeeZee, monospace",
    },
  },
  fontSizes: {
    small: "16px",
    medium: "20px",
    large: "24px",
    xlarge: "32px",
    xxlarge: "40px",
    title: "48px",
  },
  spacing: {
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px",
    xxl: "64px",
  },
  borderRadius: {
    small: "8px",
    medium: "15px",
    large: "40px",
  },
  shadows: {
    small: "0px 0px 8px 0px rgba(0, 0, 0, 0.5)",
    medium: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)",
  },
  breakpoints: {
    mobile: "768px",
    tablet: "1024px",
    desktop: "1920px",
  },
};

export const globalStyles = `
  @font-face {
    font-family: 'a시월구일1';
    src: url('/fonts/a시월구일1.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'a시월구일2';
    src: url('/fonts/a시월구일2.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
    @font-face {
    font-family: 'a시월구일3';
    src: url('/fonts/a시월구일3.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Freesentation-3Light';
    src: url('/fonts/Freesentation-3Light.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Freesentation-4Regular';
    src: url('/fonts/Freesentation-4Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Freesentation-5Medium';
    src: url('/fonts/Freesentation-5Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }
  @font-face {
    font-family: 'Freesentation-7Bold';
    src: url('/fonts/Freesentation-7Bold.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }
  @font-face {
    font-family: 'Pretendard-Regular';
    src: url('/fonts/Pretendard-Regular.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.fonts.korean.primary};
    background-color: ${theme.colors.background.main};
    color: ${theme.colors.text.primary};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
