# 리더십 딜레마 365: 위기의 12주

React + Vite 기반의 리더십 판단 시뮬레이션 MVP입니다. 현재 버전은 **localStorage 기반 mock storage**로 바로 실행되는 구조이며, 파일럿 리허설, 단일 브라우저 테스트, 강사용 데모 운영에 적합합니다.

이 앱은 정답 맞히기 게임이 아니라, 위기 상황에서 팀이 반복하는 판단 기준과 그 선택이 남기는 부담을 드러내는 **교육용 Decision Journey**입니다. 참가자는 개인 선택, 팀 토의, 산출물 작성, 결과 카드 확인, 성찰을 거치며 “우리 팀은 위기 앞에서 무엇을 반복했는가”를 돌아봅니다.

---

## 1. 핵심 콘셉트

- 배경: 가상 B2B 기업 **세림인사이트**
- 구조: **Round 0 + Week 1~11 전체 플레이 라운드 + Week 12 최종 판정**
- 목표: 조직개편 생존, 팀별 비밀 미션 달성, 판단 습관 성찰
- 방식: 개인 판단 → 팀 결정 → 산출물 → 상태값 변화 → 결과 카드 → 성찰
- 운영 철학: 점수 경쟁보다 선택의 기준, 대가, 반복 패턴을 보는 교육용 여정

---

## 2. 포함 기능

### 기본 진행

- Host 방 생성 및 입장 코드 생성
- 참가자 입장 및 팀 배정
- 6개 팀 운영: 영업, 마케팅, 연구개발, 운영, HR, 재무
- Host 진행 제어: 단계 이동, 다음 라운드, 화면 잠금, 결과 공개
- 12주 타임라인: Round 0, Week 1~11, Week 12
- Player 개인 선택 및 선택 이유 저장
- Team KSA 선택, 개인 선택 분포, 팀 결정, 산출물 입력
- 상태값 계산 및 결과 카드 공개
- Week 12 개인 성찰, 팀 선언문, 최종 판정 생성

### 리더십 게임 기능

- Round 0 KSA 9개 선택
- 팀원별 초기 역량 프로필 자동 생성
- 팀원 인물 카드 자동 배정
- 라운드 결과에 따른 역량 성장/위축 기록
- 팀 인물 카드 구성에 따른 리스크 보정
- 플레이 라운드와 LOG 후폭풍 이중 반영 방지
- 팀별 비밀 미션 판정
- 조직개편 생존/조건부 생존/전면 재편/탈락 판정
- 11개 플레이 라운드 기준의 최종 판정 밸런싱

### 강사용·운영자 기능

- 파일럿 진행 체크리스트 / 강사 대본 패널
- 파일럿 운영자 런북 문서
- 파일럿 UI/UX QA 체크리스트
- 강사용 관찰·개입 가이드
- 팀별 인물 카드 구성과 선택 부작용 디브리핑
- 교육 리포트, 인쇄/PDF 저장, Markdown 다운로드
- 다팀 비교 화면
- 운영 QA 점검판
- 리허설 샘플 시나리오 생성
- 리허설 샘플 밸런스 검증 패널
- QA 리포트 Markdown 다운로드
- 파일럿 전 최종 QA 판정표
- JSON 백업 및 JSON 가져오기
- 모바일 참가자 UX 최적화
- GitHub Actions 빌드 검증 workflow

---

## 3. 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 Vite가 표시하는 로컬 주소로 접속합니다.

빌드 확인은 다음 명령으로 실행합니다.

```bash
npm run build
```

현재 의존성은 `latest` 기반입니다. 파일럿 안정화 후 `package-lock.json` 생성과 버전 고정을 진행합니다. 자세한 기준은 `docs/dependency-stability-policy.md`와 `docs/dependency-update-checklist.md`를 봅니다.

---

## 4. Vercel 배포 설정

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

`vercel.json`이 포함되어 있어 `/host/create`, `/report/:roomId`, `/admin/:roomId`, `/guide/:roomId` 같은 직접 URL 접속과 새로고침도 `index.html`로 연결됩니다.

---

## 5. 주요 라우트

| 라우트 | 역할 |
|---|---|
| `/` | 랜딩 화면 |
| `/host/create` | Host 방 생성 |
| `/host/:roomId` | Host Dashboard / 진행 제어 |
| `/join/:joinCode` | 참가자 입장 |
| `/player/:roomId/:playerId` | Player 개인 선택·성찰 화면 |
| `/team/:roomId/:teamId` | Team KSA·팀 결정·산출물·선언문 화면 |
| `/competencies/:roomId` | 팀원 역량 프로필 / 인물 카드 구성 |
| `/compare/:roomId` | 다팀 비교 |
| `/report/:roomId` | 교육 리포트 |
| `/guide/:roomId` | 강사용 진행 가이드 |
| `/admin/:roomId` | 운영 QA 점검판 / 리허설 샘플 / 백업 |

---

## 6. 기본 운영 흐름

1. `/host/create` 접속
2. 방 생성 및 입장 코드 확인
3. 참가자는 `/join/:joinCode`로 입장
4. Round 0에서 팀별 KSA 9개 선택
5. KSA 저장 후 팀원 역량 프로필과 인물 카드 확인
6. Week 1~11에서 개인 선택, 팀 토의, 팀 결정, 산출물 저장
7. 결과 계산 후 결과 카드 공개
8. 결과 카드에서 작은 진전, 남은 부담, 인물 카드 영향 확인
9. Week 12에서 개인 성찰과 팀 선언문 저장
10. 최종 판정 생성
11. `/report/:roomId`에서 리포트 확인 및 저장
12. `/admin/:roomId`에서 QA 리포트와 JSON 백업 저장

---

## 7. 파일럿 운영 전 최종 체크리스트

파일럿 당일 운영 순서는 `docs/facilitator-pilot-runbook.md`를 먼저 확인합니다. UI/UX와 화면별 노출 기준은 `docs/pilot-ui-ux-qa-checklist.md`를 기준으로 점검합니다.

Admin 화면(`/admin/:roomId`)의 **파일럿 운영 전 최종 동선 점검표**를 따라가면 됩니다.

| 단계 | 완료 기준 |
|---|---|
| 방 만들기 | Host 화면에서 입장 코드가 보임 |
| 참가자 입장 | 참가자 이름과 팀이 Host 화면에 표시됨 |
| Round 0 KSA 저장 | 팀별 KSA 9개와 팀원 역량 프로필 생성 |
| Week 1~11 진행 | 개인 선택, 팀 결정, 산출물 저장 |
| 결과 공개 | 결과 카드에 작은 진전, 남은 부담, 인물 카드 영향 표시 |
| Week 12 마무리 | 개인 성찰과 팀 선언문 저장 |
| 리포트 다운로드 | 팀별 결과, 강사용 관찰 요약, 공통 질문이 리포트에 남음 |
| 최종 QA 판정 | `docs/pilot-final-qa-decision-table.md` 기준으로 운영 가능 여부 결정 |

20분 안에 전체 동선을 확인하려면 `docs/pilot-rehearsal-script.md`의 리허설 스크립트를 사용합니다.

---

## 8. 리허설 샘플 시나리오

Admin 화면에서 실제 파일럿 전에 리허설 데이터를 바로 생성할 수 있습니다. 버튼을 누르면 기존 리허설 데이터가 정리되고, 시나리오에 맞는 선택 패턴, 산출물 품질, 인물 카드 구성, 최종 판정이 새로 생성됩니다.

| 시나리오 | 용도 |
|---|---|
| 미션 성공형 | 정상 운영 리허설과 최종 리포트 확인 |
| 에이스 과부하형 | 빠른 실행의 성과와 에이스 소진 리스크 디브리핑 |
| 루머 대응형 | 불안·신뢰·협업 부담 디브리핑 |
| 재편 위험형 | 낮은 산출물과 반복된 속도 선택의 영향 확인 |

샘플 생성 후 바로 확인할 화면은 다음입니다.

- `/admin/:roomId`: QA 점검 상태와 리허설 샘플 밸런스 검증
- `/guide/:roomId`: 강사용 관찰·개입 가이드
- `/report/:roomId`: 교육 리포트
- `/competencies/:roomId`: 팀원 인물 카드와 역량 프로필

---

## 9. 화면별 역할

| 화면 | 역할 |
|---|---|
| Host Dashboard | 단계 제어, 다음 행동, 파일럿 진행 체크리스트, 결과 공개 |
| Team 화면 | KSA, 팀 최종 결정, 산출물, 결과 카드, 팀 선언문 |
| Player 화면 | 참가 안내, 개인 선택, 선택 이유, Week 12 개인 성찰 |
| 역량 프로필 화면 | 팀원별 KSA 기반 역량 수준, 인물 카드, 성장 기록 |
| 강사 가이드 | 라운드별 강사 멘트, 팀별 관찰 신호, 개입 질문 |
| 다팀 비교 | 팀별 판단 패턴과 리스크 비교 |
| 교육 리포트 | 최종 판정, 비밀 미션, 강사용 관찰 요약, 개인 성찰 |
| 운영 QA 화면 | 샘플 생성, 밸런스 검증, JSON 백업/가져오기, 데이터 점검, 최종 동선 체크 |

---

## 10. 팀원 인물 카드와 역량 성장

Round 0에서 팀별 KSA 9개가 저장되면 팀원별 초기 역량 프로필이 자동 생성됩니다. 각 팀원에게는 교육용 인물 카드가 함께 배정됩니다.

현재 인물 카드 예시는 다음과 같습니다.

- 에이스 실무자
- 꼼꼼한 신입
- 관계형 조율자
- 침묵형 전문가
- 도전 추진자
- 기준 수호자

라운드 결과에 따라 역량은 다음처럼 변화합니다.

| 라운드 결과 | 변화 |
|---|---|
| 높은 산출물 품질 | 선택 방식과 인물 카드 특성에 연결된 역량 성장 |
| 낮은 산출물 품질 | 해당 라운드의 부담과 인물 카드 취약 축에 위축 신호 |
| 위험 수준 리스크 | 관련 역량 위축 신호 |
| 보통 품질 + 위험 없음 | 변화 없음 |

이 값은 실제 인사평가가 아니라, 교육 중 역할 분담과 성장 초점을 토의하기 위한 출발점입니다.

---

## 11. 운영 문서 맵

| 목적 | 문서 |
|---|---|
| 파일럿 당일 운영 순서 | `docs/facilitator-pilot-runbook.md` |
| 파일럿 UI/UX QA | `docs/pilot-ui-ux-qa-checklist.md` |
| 파일럿 최종 상태 요약 | `docs/pilot-final-status-summary.md` |
| 운영자 인수인계 | `docs/pilot-operator-handoff.md` |
| 최종 운영 여부 판정 | `docs/pilot-final-qa-decision-table.md` |
| 20분 리허설 | `docs/pilot-rehearsal-script.md` |
| v1.0 릴리즈 요약 | `docs/release-notes-v1.0-pilot.md` |
| 리허설 샘플 밸런스 | `docs/rehearsal-scenario-balance-check.md` |
| 전체 Week 밸런싱 | `docs/all-week-balance-policy.md` |
| 플레이 Week와 LOG 정책 | `docs/playable-week-log-policy.md` |
| 의존성 안정화 | `docs/dependency-stability-policy.md` |
| 의존성 변경 체크리스트 | `docs/dependency-update-checklist.md` |
| Firestore 전환 계획 | `docs/firestore-migration-plan.md` |

---

## 12. 현재 제한과 다음 개발 우선순위

### 현재 제한

- 현재 데이터 저장은 localStorage 기반입니다.
- 여러 기기 간 실시간 공유는 아직 지원하지 않습니다.
- GitHub Actions CI는 구성되어 있으나 실제 파일럿 전 실행 결과 확인이 필요합니다.
- 의존성은 아직 `latest` 기반이며, 파일럿 빌드 검증 후 lock 파일과 버전 고정을 진행합니다.

### 다음 개발 우선순위

1. 실제 CI 빌드 결과 확인과 오류 수정
2. `package-lock.json` 생성 및 `npm ci` 전환
3. Firestore adapter 구현
4. Host 권한/PIN 구조
5. 실제 다중 접속 파일럿
6. 리포트 PDF/docx 출력 강화
