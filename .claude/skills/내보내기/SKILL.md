---
name: 내보내기
description: 지금 과정의 모든 단계 산출물을 순서대로 묶어 <과정이름>_과정설계.md를 만든다(승인/초안 표시, 작업 기록 포함).
disable-model-invocation: true
allowed-tools: Bash(python3 tools/export.py *) Bash(python3 tools/export.py) Bash(python3 tools/status.py *) Read
---

# /내보내기

1. 실행한다. 내용을 AI가 다시 쓰지 않고 도구가 파일을 그대로 묶는다.

   ```
   python3 tools/export.py
   ```

2. "멈춤 · 이미 있습니다"가 나오면 덮어써도 되는지 설계자에게 묻는다. 된다고 하면 `python3 tools/export.py --force`(이전 묶음은 `_v` 번호로 보관된다).
3. 만들었으면 파일 경로, 단계별 상태(승인/초안/앞 단계 바뀜), "아직 없는 산출물"이 있으면 그 목록만 알린다.
