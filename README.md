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
- 운영 안정화 화면, JSON 백업, 6팀 샘플 데이터 생성

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 표시된 로컬 주소로 접속합니다.

## Vercel 배포 설정

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

`vercel.json`이 포함되어 있어 `/host/create`, `/report/:roomId`, `/admin/:roomId` 같은 직접 URL 접속과 새로고침도 `index.html`로 연결됩니다.

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

## 기본 테스트 흐름

1. `/host/create` 접속
2. `기본 콘텐츠 초기화`
3. `방 생성`
4. 표시된 입장 코드로 참가자 입장
5. Round 0에서 KSA 선택
6. `KSA 저장하고 Week 1 개인 선택으로 이동`
7. Team 화면에서 팀 결정과 산출물 저장
8. `결과 계산하고 공개`
9. 결과 카드 확인 후 `다음 라운드로 이동`
10. Week 12에서 `최종 판정 생성`
11. `/report/:roomId`에서 리포트 확인

## 빠른 리포트 테스트 흐름

전체 라운드를 직접 진행하지 않고 교육 리포트 화면만 빠르게 확인하려면 다음 순서를 사용합니다.

1. `/host/create`에서 방 생성
2. 상단 메뉴의 `운영` 또는 `/admin/:roomId` 접속
3. `6팀 샘플 데이터 생성` 클릭
4. `교육 리포트 보기` 클릭
5. 팀별 판정, KSA, 핵심 리스크, 현업 적용 행동 확인

## 현재 제한

- Vercel 배포 후에도 데이터는 각 브라우저의 localStorage에 저장됩니다.
- 여러 참가자가 같은 방 데이터를 공유하는 실시간 교육장 운영은 Firestore adapter 구현 후 가능합니다.
- 새 배포 후 기존 브라우저 데이터가 꼬이면 새 방을 생성하거나 브라우저 localStorage를 삭제해 테스트하세요.

## 아직 남은 작업

- Firestore adapter 실제 구현
- Firestore security rules 적용
- Host PIN 및 권한 검증
- roundSnapshots/teamSnapshots 최적화
- 보안 강화: Firebase Auth, roomMembers, Cloud Functions
- UI 디테일 보강
