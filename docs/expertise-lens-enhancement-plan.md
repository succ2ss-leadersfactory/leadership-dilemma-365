# 팀별 전문지식 렌즈 고도화 계획

이 문서는 리더십 딜레마 365의 사례를 더 깊고 현실적으로 만들기 위한 수정개발 계획과 현재 반영 상태를 정리합니다.

핵심 방향은 다음입니다.

```text
참가자 화면에는 현실적인 직장 장면을 보여준다.
전문지식과 이론은 선택지, 산출물 기준, 결과 카드, 강사용 해석에 녹인다.
강사는 뒤에서 경영·조직행동·성과관리·직무 전문성으로 디브리핑한다.
```

---

## 1. 1단계: 팀별 전문지식 렌즈 데이터화 — 완료

추가 파일:

```text
src/data/seedTeamExpertiseLenses.js
```

각 팀에 다음 정보를 부여했습니다.

- businessLens
- leadershipLens
- theoryKeywords
- evidenceStandards
- commonBlindSpots
- facilitatorQuestions

이 데이터는 `gameContent.teamExpertiseLenses`로 포함됩니다.

---

## 2. 2단계: 강사용 가이드 연결 — 완료

추가 파일:

```text
src/components/TeamExpertiseLensPanel.jsx
```

연결 화면:

```text
/guide/:roomId
```

강사는 팀별로 다음 내용을 확인할 수 있습니다.

- 기능 전문성
- 리더십 관찰 포인트
- 관련 역량
- 좋은 산출물 기준
- 흔한 오판
- 강사용 질문

또한 Week 2, 3, 4, 6, 7, 9의 강사용 핵심 질문도 보강했습니다.

---

## 3. 3단계: 산출물 평가 기준 고도화 — 완료

추가 파일:

```text
src/utils/teamOutputEvidenceUtils.js
```

수정 파일:

```text
src/components/OutputForm.jsx
src/services/submissionService.js
src/pages/TeamPage.jsx
```

산출물 입력 화면에는 팀별 전문성 기준이 표시됩니다.

저장 시에는 다음 기준으로 `evidenceReview`를 남깁니다.

- 판단 근거가 충분한가
- 수치·빈도·시점 같은 구체 증거가 있는가
- 다음 행동, 책임, 확인 기준이 있는가
- 남는 부담이나 리스크 신호를 다뤘는가

---

## 4. 4단계: 결과 카드 전문성 신호 추가 — 완료

수정 파일:

```text
src/services/calculationService.js
src/components/ResultCard.jsx
```

결과 카드에는 다음 정보가 추가됩니다.

- 산출물 증거 수준
- 증거 수준 요약 문장
- 관련 역량
- 팀별 좋은 산출물 기준
- 구체 증거 신호
- 산출물 증거 수준 기반 디브리핑 질문

---

## 5. 5단계: 리포트 전문성 요약 추가 — 완료

추가 파일:

```text
src/utils/reportExpertiseUtils.js
src/components/ReportExpertiseSummaryPanel.jsx
```

수정 파일:

```text
src/pages/ReportPage.jsx
```

교육 리포트에는 팀별로 다음 정보가 표시됩니다.

- 평균 증거 수준
- 계산된 산출물 수
- 전문성 렌즈
- 관련 역량
- 강한 주차
- 취약 주차
- 보완 신호
- 강사용 질문

Markdown 다운로드에도 `팀별 전문성 요약` 섹션이 포함됩니다.

---

## 6. 현재 설계 원칙

- 이론 용어는 참가자 화면에 과도하게 노출하지 않습니다.
- 강사용 화면과 리포트에서는 이론적 해석을 제공합니다.
- 팀별 기능 전문성은 선택의 정답이 아니라 판단 기준으로 사용합니다.
- 기능별 합리성이 충돌하는 장면을 강화합니다.
- 산출물 평가는 글솜씨가 아니라 증거 수준과 판단 구조를 봅니다.
- 전문성 신호는 현재 판정 점수에 직접 강하게 반영하지 않고, 관찰·피드백·디브리핑 자료로 먼저 사용합니다.

---

## 7. 다음 고도화 후보

1. 팀별 result card 문장 세분화
2. evidenceReview를 최종 판정에 약하게 반영하는 밸런싱 실험
3. 팀별 비밀 미션 기준에 전문성 증거 수준 조건 추가
4. 리포트의 전문성 요약을 PDF/docx 출력에 최적화
5. 강사용 질문을 라운드별·팀별로 더 세분화
6. 실제 파일럿 후 산출물 예시를 기준으로 증거 수준 판정 키워드 보정
