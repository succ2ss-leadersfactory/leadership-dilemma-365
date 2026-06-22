# 전문성 고도화 문서 인덱스

이 문서는 리더십 딜레마 365의 전문성 고도화 기능을 빠르게 찾기 위한 안내 문서입니다.

전문성 고도화는 팀별 기능 전문성, 산출물 증거 수준, 결과 카드 해석, 비밀 미션, 교육 리포트 요약, 운영 QA 점검을 연결하는 흐름입니다.

```text
팀별 전문지식 렌즈
→ 산출물 입력 기준
→ 산출물 증거 수준 저장
→ 결과 카드 전문성 신호
→ 최종 판정 약한 보정
→ 비밀 미션 일부 기준 반영
→ 교육 리포트 전문성 요약
→ 운영 QA 점검
```

---

## 1. 먼저 읽을 문서

| 순서 | 문서 | 용도 |
|---|---|---|
| 1 | `docs/expertise-lens-feature-summary.md` | 전문성 고도화 기능 전체 요약 |
| 2 | `docs/expertise-lens-enhancement-plan.md` | 1~5단계 고도화 진행 상태 |
| 3 | `docs/expertise-final-adjustment-policy.md` | 산출물 증거 수준의 최종 판정 반영 기준 |
| 4 | `docs/secret-mission-expertise-evidence-policy.md` | 비밀 미션 전문성 증거 기준 |
| 5 | `docs/team-result-narrative-policy.md` | 팀별 결과 카드 문장 세분화 기준 |
| 6 | `docs/cumulative-result-narrative-report-policy.md` | 리포트 누적 해석과 경고 신호 기준 |

---

## 2. 핵심 데이터와 유틸

| 파일 | 역할 |
|---|---|
| `src/data/seedTeamExpertiseLenses.js` | 팀별 전문지식 렌즈 데이터 |
| `src/data/seedMissions.js` | 팀별 비밀 미션과 전문성 증거 기준 |
| `src/utils/teamOutputEvidenceUtils.js` | 산출물 증거 수준 계산 |
| `src/utils/expertiseFinalAdjustmentUtils.js` | 전문성 증거 수준 최종 판정 보정 |
| `src/utils/teamResultNarrativeUtils.js` | 팀별 결과 카드 문장 생성 |
| `src/utils/reportExpertiseUtils.js` | 리포트 전문성 요약과 누적 경고 생성 |
| `src/utils/opsHealthUtils.js` | 운영 QA에서 전문성 기능 점검 |

---

## 3. 화면 반영 위치

| 화면 | 파일 | 반영 내용 |
|---|---|---|
| Team 화면 | `src/components/OutputForm.jsx` | 팀별 좋은 산출물 기준, 주의할 오판, 저장된 증거 수준 |
| ResultCard | `src/components/ResultCard.jsx` | 전문성 신호, 팀별 결과 해석, 강사용 질문 |
| Facilitator Guide | `src/components/TeamExpertiseLensPanel.jsx` | 팀별 전문성 렌즈, 관련 역량, 좋은 산출물 기준 |
| Report | `src/components/ReportExpertiseSummaryPanel.jsx` | 평균 증거 수준, 반복된 진전, 반복된 대가, 경고 신호 |
| Admin QA | `src/pages/AdminOpsPage.jsx` | 전문성 렌즈, 증거 수준, 결과 해석, 경고 신호 점검 |

---

## 4. 저장되는 주요 데이터

| 위치 | 필드 | 의미 |
|---|---|---|
| `room.submissions` | `evidenceReview` | 산출물 증거 수준 리뷰 |
| `room.roundCalculations` | `outputEvidenceReview` | 결과 계산에 포함된 산출물 증거 리뷰 |
| `room.roundCalculations` | `teamResultNarrative` | 팀별 결과 카드 해석 |
| `room.finalResults` | `expertiseEvidenceAdjustment` | 최종 판정 전문성 보정 결과 |
| `room.finalResults` | `expertiseEvidenceLines` | 최종 판정 근거 문장 |
| `room.finalResults` | `missionCriteriaResults` | 비밀 미션 기준별 충족 여부 |

---

## 5. 운영자가 확인할 화면 순서

1. `/admin/:roomId`에서 전문성 QA 요약 확인
2. 리허설 샘플 생성
3. `/team/:roomId/:teamId`에서 산출물 기준과 증거 수준 확인
4. 결과 카드에서 전문성 신호와 팀별 결과 해석 확인
5. `/guide/:roomId`에서 팀별 전문성 렌즈 확인
6. `/report/:roomId`에서 전문성 요약과 누적 경고 신호 확인
7. `/admin/:roomId`에서 QA 리포트 다운로드

---

## 6. 강사용 디브리핑 초점

전문성 고도화 기능은 점수 경쟁을 강화하기 위한 장치가 아닙니다.

강사는 다음 질문을 중심으로 디브리핑합니다.

- 이 팀은 자기 기능 전문성에 맞는 증거를 남겼는가?
- 좋은 선택처럼 보였지만 어떤 대가를 계속 뒤로 미뤘는가?
- 반복된 선택 방식은 강점인가, 습관인가?
- 다음 현업에서 줄여야 할 부담은 무엇인가?
- 산출물은 상무나 타부서가 믿을 수 있는 증거가 되었는가?
- 비밀 미션을 충족하기에 충분한 전문성 증거가 있었는가?

---

## 7. 현재 제한

- 산출물 증거 수준은 자동 키워드 기반 보조 판단입니다.
- 최종 판정에는 약하게만 반영합니다.
- 비밀 미션에는 일부 기준으로만 반영합니다.
- Markdown 리포트에는 누적 결과 해석, 반복된 진전, 반복된 대가, 강사용 경고 신호가 포함됩니다.
- 실제 파일럿 후 산출물 문장에 맞춰 키워드와 문장을 보정해야 합니다.

---

## 8. 다음 개발 후보

1. 팀별 result narrative를 라운드별로 더 세분화
2. 실제 파일럿 산출물 기반으로 evidenceReview 키워드 보정
3. 전문성 QA 문서를 파일럿 최종 QA 판정표에 연결
4. Markdown 다운로드에 반복 대가 발생 라운드 추가
