# 리더십 딜레마 365: 위기의 12주 — React MVP v1

React + Vite 기반의 리더십 판단 시뮬레이션 MVP 초안입니다. 현재 버전은 **localStorage 기반 mock storage**로 바로 실행되는 구조이며, Firebase 전환을 위한 `firebase.js`, 서비스 분리, 라우트 구조를 포함합니다.

## 포함 기능

- Host 방 생성
- 입장 코드 생성
- 참가자 입장: placeholder `김박사`
- 기본 6팀
- Host 진행 제어: 단계 이동, 다음 라운드, 화면 잠금
- Player 개인 선택 및 이유 저장
- Team KSA 선택, 개인 선택 분포, 팀 결정, 산출물 입력
- 상태값 계산 및 결과 카드 공개
- Week 12 최종 판정 생성
- 다팀 비교
- 교육 리포트 및 인쇄/PDF 저장
- 운영 안정화 화면 및 JSON 백업

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 표시된 로컬 주소로 접속합니다.

## Firebase 설정

`.env.example`을 복사해 `.env`를 만들고 Firebase 값을 입력합니다.

```bash
cp .env.example .env
```

현재 MVP 코드는 localStorage mock mode가 기본입니다. Firestore 실시간 연결은 다음 개발 Sprint에서 `services/storage.js`를 Firestore adapter로 교체하는 방식으로 확장하세요.

## 주요 라우트

- `/` 랜딩
- `/host/create` Host 방 생성
- `/host/:roomId` Host Dashboard
- `/join/:joinCode` 참가자 입장
- `/player/:roomId/:playerId` Player 화면
- `/team/:roomId/:teamId` Team 화면
- `/compare/:roomId` 다팀 비교
- `/report/:roomId` 교육 리포트
- `/admin/:roomId` 운영 안정화

## 테스트 흐름

1. `/host/create` 접속
2. `기본 콘텐츠 초기화`
3. `방 생성`
4. 표시된 입장 코드로 참가자 입장
5. Host에서 `다음 단계`를 눌러 `playerVote`로 이동
6. Player에서 개인 선택 저장
7. Team 화면에서 팀 결정과 산출물 저장
8. Host에서 `계산 후 결과 공개`
9. `다음 라운드`로 반복 진행
10. Week 12에서 `최종 판정 생성`
11. `/report/:roomId`에서 리포트 확인

## 아직 남은 작업

- Firestore adapter 실제 구현
- Firestore security rules 적용
- Host PIN 및 권한 검증
- roundSnapshots/teamSnapshots 최적화
- 보안 강화: Firebase Auth, roomMembers, Cloud Functions
- UI 디테일 보강
