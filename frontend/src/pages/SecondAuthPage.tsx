import React, { useState } from 'react';
import styled from '@emotion/styled';
import Button from '../components/common/Button';
import axios from 'axios';

/*
 * 요청사항 : line20 useStete이름 변경. 버튼으로 교체
 * useState변수이름 수정했습니다.
 * 직접 만든 버튼에서 공용버튼으로 교체했습니다.
 */
const SecondAuthPage: React.FC = () => {
  /*
   * authCode : 서버로부터 받아온 인증코드 관리.
   * errMsg : "코드가 일치하지 않습니다." 문구 관리.
   */
  const [authCode, setAuthcode] = useState<string>('');
  const [errMsg, setErrmsg] = useState<string>('');

  /*
   * 요청사항 : onCheck 이벤트 속성 명시
   * event.preventDefault(); 사용이 필요없어져서 삭제합니다.
   * 마지막 동기처리 안쓸거같아서 삭제합니다. (.then)
   */
  const onCheck = () => {
    axios
      .get(`http://localhost:4000/auth/${1}`)
      .then(function (response) {
        if (authCode === response.data.authCode) {
          setErrmsg('');
          alert(`안녕하세요 ${response.data.user}!`);
        } else setErrmsg('코드가 일치하지 않습니다');
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  /*
   * 제이슨서버 id:2에 유저정보및 인증코드가 들어있다고 가정하고
   * axios로 값을 요청합니다.
   * 성공 또는 실패에 맞게 then, catch로.
   * post patch delete는 이 페이지 제작엔 필요없을거같아서 삭제.
   * 마지막 동기처리 안쓸거같아서 삭제합니다. (.then)
   */
  const onGetQuery = () => {
    axios
      .get(`http://localhost:4000/auth/${1}`)
      .then(function (response) {
        alert('인증코드 : ' + response.data.authCode);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  return (
    <Wrap>
      <LoginBox>
        <MainText>등록된 이메일로 받은 코드를 입력해 주세요</MainText>
        <div>
          <Input
            className="input"
            placeholder="인증코드를 입력하세요"
            type="text"
            onChange={event => {
              setAuthcode(event.target.value);
              setErrmsg('');
            }}
            required
          />
          <SubText>{errMsg}</SubText>
          <ButtonBox>
            <Button color="white" text="코드 재전송" width={130} height={30} onClick={onGetQuery} />
            <Button color="white" text="확인" width={130} height={30} onClick={onCheck} />
          </ButtonBox>
        </div>
      </LoginBox>
    </Wrap>
  );
};

/*
 * 중앙정렬할 자식태그를 위해서 부모태그의 높이를 전체로 수정합니다.
 * 그후 block인 div의 속성을 flex키워드로 바꿔주고 'justify-content' & 'align-items'로 정렬합니다.
 */
const Wrap = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

/*
 * 로그인 2차인증을 위한 창 디자인
 * border, border-radius : 외곽선.
 * width, height : 자식으로부터 범위재지정.
 * text-align : 내부 문자를 중앙정렬해줍니다.(center)
 * display, flex-direction, justify-content : 중앙정렬
 */
const LoginBox = styled.div`
  border: 2px solid ${props => props.theme.colors.main};
  border-radius: 20px;
  min-width: 587px;
  width: 587px;
  height: 367px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

/*
 * 메인텍스트 태그 디자인입니다.(등록된 이메일로 받은 코드를 입력해 주세요)
 */
const MainText = styled.p`
  font-size: 24px;
  margin-top: 30px;
  margin-bottom: 60px;
  font-weight: bold;
  color: ${props => props.theme.colors.main};
`;

/*
 * 인풋창 디자인 (인증코드를 입력하는 곳)
 * boder를 지워버리고 border-bottom만 사용해서 언더바로 스타일링했습니다.
 * 피그마의 인스펙트와 같게 width를 줬습니다. height는 임의값입니다.
 */
const Input = styled.input`
  text-align: center;
  font-size: 14px;
  border: none;
  border-bottom: 1px solid #000;
  width: 256px;
  height: 40px;
  outline: none;
`;

/*
 * 그다음은 서브텍스트 스타일링입니다.
 * "코드가 일치하지 않습니다" 라는 문구를 임시적으로 스타일링 해뒀습니다.
 * 안쪽 패딩값을 통해서, 비율을 맞춰줬습니다.
 * (다현님 피드백에 따라 p태그로 바꿨습니다)
 * SubText의 패딩값으로 정렬하지말고, 마진값으로 정렬했습니다.
 * padding: 40px 0; -> margin: 10px 0;
 * font-family: 'Noto Sans KR', sans-serif;가 전역에 설정되어있으니까 빼자
 */
const SubText = styled.p`
  margin: 10px 0;
  color: ${props => props.theme.colors.red};
  font-style: normal;
  font-size: 14px;
  height: 14px;
`;

/*
 * 버튼(코드 재전송, 확인)의 부모태그입니다.
 * 버튼정렬과, 공용버튼의 세부적인 디자인을 지정합니다.
 */
const ButtonBox = styled.div`
  & button {
    border-radius: 5px;
    font-size: 18px;
  }
  & :hover {
    background-color: ${props => props.theme.colors.main};
    color: ${props => props.theme.colors.white};
  }

  padding: 0px 140px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default SecondAuthPage;
