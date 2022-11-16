## 폴더 이름
camelCase

### 폴더 구조
```plaintext
backend
├── src // 하위에 도메인 별 폴더가 위치함
│   ├── user
│   ├── chat
│   └── common 
│   ...
└── test // 테스트 파일 위치
```

## 파일 이름
- [name.type.ts] (e.g. user.service.ts, chat.controller.ts)

## 들여쓰기
들여쓰기는 공백 2칸으로 사용

## vscode eslint 익스텐션 사용하기
```
// .eslint.js 파일

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};

```
settings.json에 아래 코드를 추가하면 저장할 때 마다 포맷팅 됨
```
  "eslint.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
```
참고자료 : https://www.youtube.com/watch?v=Y3kjHM7d3Zo&t=652s

## 참고 자료 
구글 ts 스타일 가이드 https://google.github.io/styleguide/tsguide.html