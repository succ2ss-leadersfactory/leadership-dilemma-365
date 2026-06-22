# 리더십 딜레마 365: 위기의 12주 — React MVP v1

React + Vite 기반의 리더십 판단 시뮬레이션 MVP입니다. 현재 버전은 **localStorage 기반 mock storage**로 바로 실행되는 구조이며, 교육장 리허설과 단일 브라우저 테스트에 적합합니다.

이 앱은 정답 맞히기 게임이 아니라, 위기 상황에서 팀이 반복하는 판단 기준과 그 선택이 남기는 부담을 드러내는 **교육용 Decision Journey**입니다.

## 포함 기능

- Host 방 생성 및 입장 코드 생성
- 참가자 입장 및 팀 배정
- 기본 6팀 운영
- Host 진행 제어: 단계 이동, 다음 라운드, 화면 잠금
- 상단 라운드 타임라인: R0, W1, W5, W8, W10, W11, W12
- Player 개인 선택 및 선택 이유 저장
- Week 12 개인 성찰 저장
- Team KSA 선택, 개인 선택 분포, 팀 결정, 산출물 입력
- 상태값 계산 및 결과 카드 공개
- Week 12 팀 선언문 및 최종 판정 생성
- 강사용 진행 가이드
- 다팀 비교 화면
- 교육 리포트, 인쇄/PDF 저장, Markdown 다운로드
- 운영 안정화 화면: JSON 백업, JSON 가져오기, 데이터 건강도 점검, 6팀 샘플 데이터 생성

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

`vercel.json`이 포함되어 있어 `/host/create`, `/report/:roomId`, `/admin/:roomId`, `/guide/:roomId` 같은 직접 URL 접속과 새로고침도 `index.html`로 연결됩니다.

## 주요 라우트

- `/` 랜딩
- `/host/create` Host 방 생성
- `/host/:roomId` Host Dashboard
- `/join/:joinCode` 참가자 입장
- `/player/:roomId/:playerId` Player 화면
- `/team/:roomId/:teamId` Team 화면
- `/compare/:roomId` 다팀 비교
- `/report/:roomId` 교육 리포트
- `/guide/:roomId` 강사용 진행 가이드
- `/admin/:roomId` 운영 안정화

## 기본 테스트 흐름

1. `/host/create` 접속
2. `기본 콘텐츠 초기화`
3. `방 생성`
4. 표시된 입장 코드로 참가자 입장
5. Round 0에서 KSA 선택
6. `KSA 저장하고 Week 1 개인 선택으로 이동`
7. 참가자 화면에서 개인 선택 저장
8. Team 화면에서 팀 결정과 산출물 저장
9. `결과 계산하고 공개`
10. 결과 카드 확인 후 `다음 라운드로 이동`
11. Week 12에서 개인 성찰과 팀 선언문 저장
12. `최종 판정 생성`
13. `/report/:roomId`에서 리포트 확인

## 빠른 리포트 테스트 흐름

전체 라운드를 직접 진행하지 않고 교육 리포트 화면만 빠르게 확인하려면 다음 순서를 사용합니다.

1. `/host/create`에서 방 생성
2. 상단 메뉴의 `운영` 또는 `/admin/:roomId` 접속
3. `6팀 샘플 데이터 생성` 클릭
4. `데이터 건강도` 표 확인
5. `교육 리포트 보기` 클릭
6. 팀별 판정, KSA, 핵심 리스크, 팀 선언문, 개인 성찰, 현업 적용 행동 확인
7. `Markdown 다운로드` 또는 `인쇄 / PDF 저장`으로 결과물 저장

## 교육 운영 화면별 역할

| 화면 | 역할 |
|---|---|
| Host Dashboard | 단계 제어, 운영 현황, 다음 행동 확인 |
| Team 화면 | KSA, 팀 최종 결정, 산출물, 팀 선언문, 최종 판정 생성 |
| Player 화면 | 개인 선택, 선택 이유, Week 12 개인 성찰 |
| 강사 가이드 | 라운드별 디브리핑 질문과 강사 멘트 확인 |
| 다팀 비교 | 팀별 판단 패턴과 리스크 비교 |
| 교육 리포트 | 최종 판정, 팀 선언문, 개인 성찰, 현업 적용 행동 정리 |
| 운영 화면 | 샘플 생성, JSON 백업/가져오기, 데이터 건강도 점검 |

## 현재 제한

- Vercel 배포 후에도 데이터는 각 브라우저의 localStorage에 저장됩니다.
- 여러 참가자가 서로 다른 기기에서 같은 방 데이터를 공유하는 실시간 교육장 운영은 아직 지원하지 않습니다.
- 실제 다중 접속 운영은 Firestore adapter 구현 후 가능합니다.
- 새 배포 후 기존 브라우저 데이터가 꼬이면 새 방을 생성하거나 브라우저 localStorage를 삭제해 테스트하세요.

## Firebase 전환 방향

`.env.example`을 복사해 `.env`를 만들고 Firebase 값을 입력합니다.

```bash
cp .env.example .env
```

다음 Sprint에서는 `services/storage.js`를 Firestore adapter로 교체하고, room, players, teamDecisions, submissions, declarations, finalResults를 Firestore 컬렉션/문서 구조로 분리합니다.

## 아직 남은 작업

- Firestore adapter 실제 구현
- Firestore security rules 적용
- Host PIN 및 권한 검증
- roomMembers 권한 구조
- 실시간 참가자 동기화
- roundSnapshots/teamSnapshots 최적화
- Firebase Auth 또는 익명 인증 검토
- UI 디테일 보강
