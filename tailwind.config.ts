import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 별채홈피 = 따뜻한 크림/아이보리 미니홈피 톤
        cream:   '#FAF6F0',
        parchment: '#F0E8D8',
        sand:    '#E8D8C0',
        mocha:   '#8B6F47',
        bark:    '#5C3D2E',
        sky:     '#B8D4E8',
        blush:   '#F0B8C0',
        sage:    '#A8C8A0',
        gold:    '#D4A820',
        silver:  '#A0A8B0',
        bronze:  '#C87840',
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
