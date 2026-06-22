# 팀별 결과 해석 누적 리포트 정책

이 문서는 라운드별 결과 카드의 팀별 해석을 교육 리포트에서 누적 패턴으로 보여주는 기준입니다.

## 목적

리포트에서 팀이 12주 동안 반복한 진전과 대가를 볼 수 있게 합니다.

확인 질문은 세 가지입니다.

- 이 팀은 어떤 진전을 반복했는가?
- 어떤 대가가 반복적으로 남았는가?
- 팀의 기능 전문성 관점에서 무엇을 놓쳤는가?

## 데이터 기준

기준 데이터는 라운드 계산 결과에 저장된 값입니다.

```text
room.roundCalculations[*].teamResultNarrative
```

각 결과 해석은 `gain`, `risk`, `question`을 가집니다.

## 리포트 반영

`src/utils/reportExpertiseUtils.js`에서 팀별 계산 결과를 모아 다음 값을 만듭니다.

```text
narrativeCount
narrativeSummary
repeatedGains
repeatedRisks
narrativeQuestions
topChoiceType
```

`src/components/ReportExpertiseSummaryPanel.jsx`에서는 다음을 보여줍니다.

- 결과 해석 기록 수
- 누적 결과 해석
- 반복된 진전
- 반복된 대가
- 강사용 질문

## 설계 원칙

- 점수 계산에는 직접 반영하지 않습니다.
- 결과 카드를 대체하지 않고 리포트에서 누적 패턴을 보여줍니다.
- 강사용 디브리핑 문장으로 사용합니다.

## 후속 개선 후보

- Markdown 다운로드에 누적 결과 해석 추가
- 누적 대가가 반복될 때 강사용 경고 신호 생성
- 실제 파일럿 후 어색한 문장 보정
