# v1.0 Pilot Release Notes

릴리즈명: **리더십 딜레마 365: 위기의 12주 — v1.0 Pilot**

이 문서는 파일럿 운영 전 공유용 요약입니다.

---

## 이번 버전의 목적

v1.0 Pilot은 교육장 리허설과 단일 브라우저 데모 운영을 위한 첫 운영 버전입니다.

핵심 목적은 다음과 같습니다.

- 12주 위기 상황을 따라가며 팀의 판단 습관을 확인합니다.
- 개인 판단, 팀 결정, 산출물, 결과 카드, 성찰 흐름을 연결합니다.
- 팀원 인물 카드와 역량 프로필을 활용해 디브리핑 소재를 제공합니다.
- 강사용 가이드와 교육 리포트로 운영 후 회고 자료를 남깁니다.
- 교육생 화면은 피드백과 토의 흐름 중심으로, 강사용 화면은 판정 근거와 개입 질문 중심으로 분리합니다.

---

## 포함 기능

- Host 방 생성과 입장 코드
- 참가자 입장과 팀 배정
- Round 0 KSA 선택
- 팀원 역량 프로필 자동 생성
- 팀원 인물 카드 자동 배정
- Week 1~11 전체 플레이 라운드
- Week 12 최종 판정
- 개인 판단과 선택 이유 저장
- 팀 최종 선택과 산출물 저장
- 결과 카드와 상태값 계산
- 인물 카드 영향 기록
- 역량 성장/위축 기록
- 강사용 관찰·개입 가이드
- 교육 리포트와 Markdown 다운로드
- 운영 QA 점검판
- 리허설 샘플 시나리오
- 파일럿 최종 동선 점검표
- 운영 문서 패키지 인덱스
- 파일럿 운영자 런북
- 파일럿 UI/UX QA 체크리스트
- 파일럿 종료 후 회고 기록 템플릿
- 모바일 참가자 화면 개선
- GitHub Actions 빌드 검증 workflow

---

## 이번 릴리즈의 UI/UX 개선

v1.0 Pilot 기준으로 아래 UI/UX가 반영되었습니다.

| 구분 | 개선 내용 |
|---|---|
| 참가 안내 | 개인 판단, 이유 기록, 팀 토의, 피드백 확인 흐름을 첫 화면에서 안내 |
| Player 화면 | 개인 판단 기준과 선택 이유 작성 힌트 강화 |
| Team 화면 | 개인 판단 모아보기와 팀 토의 출발점 시각화 |
| KSA 선택 | Round 0 KSA 선택 진행률과 저장 가능 조건 표시 |
| 라운드 상황 카드 | 판단 질문, 지금 벌어진 일, 팀 신호를 구분해 제시 |
| 전략 이벤트 카드 | 외부 신호, 압박, 숨은 대가, 전략적 기회를 분리 |
| 12주 타임라인 | 현재 위치와 PLAY/LOG 흐름을 구분 |
| 선택지 카드 | 선택 상태, 선택 번호, 판단 힌트가 보이는 카드형 UI |
| 산출물 입력 | 실행 약속, 책임자, 확인 시점, 남는 부담 중심으로 작성 안내 |
| 결과 카드 | 작은 진전, 남은 부담, 다음 신호 중심의 피드백 카드화 |
| 최종 판정 | 순위표가 아니라 12주 판단 습관을 돌아보는 마무리 피드백으로 재구성 |
| 역량 프로필 | 교육생 화면은 강점/주의/성장 초점 중심, 강사용 화면은 상세 수준 정보 유지 |

---

## 교육생/강사용 정보 분리

교육생 화면에서는 아래 정보가 중심입니다.

```text
현재 할 일
개인 판단과 이유
팀 토의 출발점
산출물 작성 기준
작은 진전
남은 부담
다음 행동
성찰 질문
```

강사용 화면과 리포트에는 아래 정보가 유지됩니다.

```text
비밀 미션 제목과 점수
판정 근거
중간 사건 후폭풍 근거
강사용 질문
인물 카드 영향 기록
팀별 전문성 경고 신호
산출물 증거 수준
역량 프로필 상세 수준
```

---

## 주요 화면

| 화면 | 경로 |
|---|---|
| 방 생성 | `/host/create` |
| Host Dashboard | `/host/:roomId` |
| 참가자 입장 | `/join/:joinCode` |
| Player | `/player/:roomId/:playerId` |
| Team | `/team/:roomId/:teamId` |
| 역량 프로필 | `/competencies/:roomId` |
| 강사 가이드 | `/guide/:roomId` |
| 교육 리포트 | `/report/:roomId` |
| 운영 QA | `/admin/:roomId` |

---

## 리허설 샘플

Admin 화면에서 다음 샘플을 생성할 수 있습니다.

- 미션 성공형
- 에이스 과부하형
- 루머 대응형
- 재편 위험형

샘플 생성 후 `/guide/:roomId`, `/report/:roomId`, `/competencies/:roomId`, `/admin/:roomId`를 확인합니다.

---

## 파일럿 전 확인 순서

1. `docs/pilot-document-package-index.md`로 상황별 운영 문서 위치를 확인합니다.
2. `docs/facilitator-pilot-runbook.md`로 운영 당일 순서를 확인합니다.
3. `docs/pilot-ui-ux-qa-checklist.md`로 교육생/강사용 화면 노출 기준을 확인합니다.
4. `npm install`
5. `npm run dev`
6. `/host/create`에서 방 생성
7. `/admin/:roomId`에서 최종 동선 점검표 확인
8. 리허설 샘플 1개 생성
9. `/guide/:roomId` 확인
10. `/report/:roomId`에서 Markdown 다운로드 확인
11. `docs/pilot-rehearsal-script.md`에 따라 20분 리허설 수행
12. `docs/pilot-final-qa-decision-table.md` 기준으로 운영 가능 여부 판정

---

## 운영 메모

- 참가자에게 먼저 “정답 맞히기 게임이 아니다”라고 안내합니다.
- 개인 판단을 먼저 저장한 뒤 팀 토의를 진행합니다.
- 팀 토의에서는 다수결보다 선택이 갈린 이유를 먼저 봅니다.
- 산출물은 긴 글이 아니라 실행 약속으로 작성하게 합니다.
- 결과 카드에서는 숫자보다 남은 부담을 먼저 봅니다.
- 인물 카드는 평가가 아니라 토의용 역할 렌즈로 다룹니다.
- 마지막에는 개인 성찰과 팀 선언문을 남깁니다.
- 파일럿 전에는 새 기능을 추가하지 않고 문구 보정과 명백한 오류 수정만 허용합니다.
- 파일럿 종료 후에는 `docs/pilot-post-run-retrospective-template.md`로 개선 항목을 기록합니다.

---

## 현재 제한

- 현재 데이터 저장은 localStorage 기반입니다.
- 여러 기기 간 실시간 공유는 후속 버전에서 다룹니다.
- Firestore 전환은 별도 Sprint에서 진행합니다.
- GitHub Actions CI는 구성되어 있으나 실제 파일럿 전 실행 결과를 확인해야 합니다.
- 의존성은 현재 `latest` 기반이며, 파일럿 빌드 검증 후 lock 파일과 버전 고정을 진행합니다.

---

## 관련 문서

- `README.md`
- `docs/pilot-document-package-index.md`
- `docs/facilitator-pilot-runbook.md`
- `docs/pilot-ui-ux-qa-checklist.md`
- `docs/pilot-post-run-retrospective-template.md`
- `docs/pilot-final-status-summary.md`
- `docs/pilot-operator-handoff.md`
- `docs/pilot-final-qa-decision-table.md`
- `docs/pilot-rehearsal-script.md`
- `docs/firestore-migration-plan.md`
- `docs/dependency-stability-policy.md`
- `docs/dependency-update-checklist.md`
