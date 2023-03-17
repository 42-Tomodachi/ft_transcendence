# git commit convection

> `[FE {#이슈넘버}] {커밋 타입}: {내용}`  
> ex. `[FE #13] CHORE: init commit`

## commit type

- FEAT: 새로운 기능 추가
- FIX: 버그 수정
- REFACTOR: 코드 리팩토링
- DESIGN: CSS등 사용자 UI 디자인 변경
- TEST: 테스트 코드 추가
- CHORE: 그 외 기타 수정
- DOCS: 코드가 아닌 문서를 수정한 경우
- RENAME: 파일 혹은 폴더명을 수정하거나 위치(경로)를 변경
- REMOVE: 파일을 삭제하는 작업만 수행

## 참고 링크

[블로그](https://overcome-the-limits.tistory.com/entry/%ED%98%91%EC%97%85-%ED%98%91%EC%97%85%EC%9D%84-%EC%9C%84%ED%95%9C-%EA%B8%B0%EB%B3%B8%EC%A0%81%EC%9D%B8-git-%EC%BB%A4%EB%B0%8B%EC%BB%A8%EB%B2%A4%EC%85%98-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)

# git branch convection

> `FE-{#이슈넘버}-{기능 명세}`  
> ex. `FE-#14-make-readme`

- main(최종 결과) / dev(중간 결과)
- dev가 기본 브랜치이므로 merge를 할 때는 dev로 할 것
- **무조건 2명 이상의 리뷰어에게 approve를 받고 merge를 진행**
- merge할 때는 되도록 **merge commit**을 남기는 방향으로 진행
- merge가 완료됐으면 merge를 완료한 작업자가 브랜치도 삭제
