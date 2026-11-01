---
name: 과정
description: 지금 작업 중인 과정을 보여 주거나 다른 과정으로 바꾼다.
argument-hint: "[<과정이름>]"
disable-model-invocation: true
allowed-tools: Bash(python3 tools/status.py *)
---

# /과정

받은 값: `$ARGUMENTS`

- 값이 비어 있으면 `python3 tools/status.py show`를 실행해 결과를 그대로 보여 준다.
- 값이 있으면 `python3 tools/status.py current "$ARGUMENTS"`를 실행한 뒤 `python3 tools/status.py show`로 상태를 보여 준다.
- 과정이 없다고 나오면 `courses/` 아래 폴더 이름을 보여 주고 멈춘다.
