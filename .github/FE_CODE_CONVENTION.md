# Tomodachi Frontend Code Convention

> 코딩하며 지켜야 할 약속들에 대해 기술한 문서

## Directory name

camelCase

### Directory structure

```plaintext
src
├── api         // 모든 api 요청은 여기서 선언
├── assets      // image or media
├── components
│   ├── common  // 공통으로 쓰는 경우 이곳에
│   │    └── Button.tsx
│   └── Login   // 기능별로 묶어서 폴더로 정리
├── pages
│   ├── LoginPage.tsx // page별
├── utils
│   ├── constants     // 상수 선언
│   ├── hooks         // custom hooks
│   ├── unterfaces    // interface 설정
│   ├── type          // type 설정
│   └── styles        // 전역, theme 스타일 설정
├── App.tsx
└── index.tsx

```

---

## File name

- 컴포넌트 : PascalCase.tsx
- 그 외 : camelCase.ts

## in File

### Variable

- camelCase

### Function

- camelCase
- 동사 + 명사
- 가능한 어떤 동작을 하는 함수인지 이해하기 쉽도록 작성
- (최소 기능으로 나눌 수 있다면 함수 이름이 너무 길어지는 케이스가 줄어듬)

### Functional Components

- PascalCase
- 컴포넌트 만들 때 함수형 컴포넌트 정의와 export 선언은 따로 작성

```js
const SomeComponent: React.FC<SomeInterface> = () => {
  return ();
}

export default SomeComponent;
```

### Custom hooks

- use를 앞에 붙여 작성

### Interface

- PascalCase
- props 의 Interface 를 선언할때 : **[컴포넌트명]Props** ( ex : `ChatProps` )
  - props 의 Interface 의 경우 해당 컴포넌트 파일 상단에 Interface 정의 (export 하지 않음)
- 기본 Interface 의 경우 : **I[이름]** ( ex: `IUser` )

### Type

- **[이름]Type** ( ex : `ReplyType` )
- 앞글자는 대문자로

### Contant

- 대문자가 기본, 언더바(\_)로 단어 구분
- 2번 이상 사용되는 string은 constants.ts 에 꼭 넣기

---

## Style Guide

### 참고 링크

[네이버 스타일 가이드](https://github.com/naver/eslint-config-naver/blob/master/STYLE_GUIDE.md)

[모던 자바스크립트 튜토리얼 - 스타일 가이드](https://ko.javascript.info/coding-style)

---

## 닌자 코드(하면 안되는 것들!)

### 코드 짧게 쓰기

### 글자 하나만 사용하기

### 약어 사용하기

### 포괄적인 명사 사용하기

### 철자가 유사한 단어 사용하기

### 동의어 사용하기

### 변수 이름 재사용하기

### 언더스코어 사용하기

### 과장 형용사 사용하기

### 외부 변수 덮어쓰기

### 부작용(Side Effect)이 있는 코드 작성하기

### 다양한 기능을 하는 함수 만들기

### 참고 링크

[모던 자바스크립트 튜토리얼 - 닌자코드](https://ko.javascript.info/ninja-code)
