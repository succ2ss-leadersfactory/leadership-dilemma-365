---
name: 검토
description: red-team-reviewer를 불러 한 단계 산출물을 방법론 10장과 분야 전문가 관점으로 검토하고 review_<단계>_<회차>.md로 남긴다.
argument-hint: <1|2|2b|3-1|3-2>
disable-model-invocation: true
allowed-tools: Bash(python3 tools/status.py *) Read Write Agent
---

# /검토

받은 값: `$ARGUMENTS`

## 1. 대상 정하기

- `python3 tools/status.py current`로 과정 폴더를 확인한다.
- 대상 파일: 1 → `01_과정브리프.md`, 2 → `02b_회신반영.md`가 있으면 그것, 없으면 `02_확인요청서.md`, 2b → `02b_회신반영.md`, 3-1 → `03_구조안.md`, 3-2 → `04_커리큘럼표.md`. 없으면 멈추고 `/단계`로 먼저 만들라고 알린다.
- 저장할 경로를 받는다.

  ```
  python3 tools/status.py review-path $0
  python3 tools/status.py now
  ```

## 2. 검토자 부르기

Agent 도구로 `red-team-reviewer`를 `run_in_background: false`로 불러(결과가 올 때까지 기다림) 아래를 넘긴다.

```
과정 폴더: <폴더>
검토 단계: <단계와 이름>
검토 회차: <review-path의 회차 숫자>
검토 대상: <대상 파일>
함께 읽을 파일: 00_요청.md, 이 단계의 입력이 된 앞 단계 산출물, 03_고객회신.md(있으면), 같은 단계 이전 검토 파일(있으면)
설계자가 덧붙인 관점: (이번 메시지에 있으면 그대로, 없으면 "없음")
검토 본문만 돌려주세요. 파일은 고치지 마세요.
```

## 3. 저장과 기록

1. 돌려받은 본문을 고치지 말고, `검토 시각: (메인 대화가 채움)`만 `now` 결과로 바꿔 review-path 경로에 저장한다. 검토 대상 산출물은 고치지 않는다.
2. 기록한다(상태는 바꾸지 않는다).

   ```
   python3 tools/status.py log "$0단계 · 검토 <회차>회차 · <review 파일 이름> · 꼭 고침 N개, 고치면 좋음 N개"
   ```

## 4. 답하기

- 검토 파일 경로
- 요약 줄과 "꼭 고침" 지적의 번호·한 줄 요지
- 다음 할 일: 반영하려면 `/수정 $0 review_<단계>_<회차>의 1, 3번 반영`처럼 부른다. 검토 결과를 자동으로 반영하지 않는다.
