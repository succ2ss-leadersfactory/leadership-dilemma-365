# 팀별 결과 카드 문장 세분화 정책

이 문서는 같은 선택 유형이라도 팀별 기능 전문성과 라운드 맥락에 따라 결과 해석 문장이 다르게 보이도록 한 기준을 정리합니다.

---

## 1. 목적

기존 결과 카드는 선택 유형과 상태값 중심으로 결과를 보여줬습니다.

이번 보강은 같은 SPEED, STRUCTURE, BALANCE, ALIGN 선택이라도 팀마다 실제 현업 대가가 다르고, 같은 팀 안에서도 Week 맥락에 따라 대가가 달라진다는 점을 반영합니다.

예를 들어 영업팀 SPEED 선택도 Week에 따라 다르게 해석됩니다.

```text
Week 2: 빠른 반응 고객은 잡았지만 관망 고객의 불안이 분리되지 않을 수 있다.
Week 11: 막판 숫자는 만들었지만 다음 분기까지 이어질 고객 신뢰 근거가 약할 수 있다.
```

---

## 2. 구현 방식

추가/수정 파일:

```text
src/utils/teamResultNarrativeUtils.js
```

이 파일은 두 단계로 결과 해석 문장을 반환합니다.

```text
1차: teamId + roundId + choiceInternalType
2차 fallback: teamId + choiceInternalType
```

라운드별 문장이 있으면 라운드별 문장을 먼저 사용합니다.

라운드별 문장이 없으면 기존 팀별 기본 문장을 사용합니다.

선택 유형은 다음 네 가지입니다.

```text
SPEED / STRUCTURE / BALANCE / ALIGN
```

---

## 3. 우선 세분화한 라운드

라운드별 문장은 모든 라운드를 한 번에 세분화하지 않고, 전문성 증거 기준과 연결되는 핵심 주차부터 적용합니다.

| 팀 | 세분화 주차 |
|---|---|
| 영업팀 | week2, week11 |
| 마케팅팀 | week2, week11 |
| 연구개발팀 | week4, week11 |
| 운영팀 | week6, week8, week11 |
| HR팀 | week10, week11 |
| 재무팀 | week4, week11 |

---

## 4. 결과 카드 반영

수정 파일:

```text
src/components/ResultCard.jsx
```

결과 카드에는 다음 섹션이 표시됩니다.

```text
팀별 결과 해석
- 진전
- 남은 대가
- 강사용 질문
```

결과 카드 화면은 계산 결과에 저장된 `teamResultNarrative`를 먼저 사용합니다.

저장된 값이 없으면 `teamId + roundId + choiceInternalType`으로 다시 조회합니다.

---

## 5. 계산 결과 저장

수정 파일:

```text
src/services/calculationService.js
```

라운드 계산 결과에는 `teamResultNarrative`가 저장됩니다.

```text
room.roundCalculations[*].teamResultNarrative
```

계산 시 `roundId`를 함께 넘기므로, 이후 리포트·QA·백업 데이터에서도 라운드 맥락이 반영된 결과 해석을 재사용할 수 있습니다.

---

## 6. 설계 원칙

- 결과 카드의 기본 구조는 유지합니다.
- 팀별 문장은 점수 계산을 직접 바꾸지 않습니다.
- 참가자가 바로 이해할 수 있는 직장 언어로 씁니다.
- 라운드별 문장은 모든 주차를 기계적으로 늘리지 않고, 전문성 판단이 뚜렷한 주차부터 적용합니다.
- 강사는 이 문장을 바탕으로 기능 전문성과 리더십 판단을 연결해 디브리핑합니다.

---

## 7. 후속 개선 후보

1. 실제 파일럿 후 어색한 라운드별 문장 보정
2. 모든 Week의 팀별 전용 문장 확장
3. 라운드별 문장을 비밀 미션 근거와 더 직접 연결
4. 누적 리포트에서 라운드별 문장 변화 추적
