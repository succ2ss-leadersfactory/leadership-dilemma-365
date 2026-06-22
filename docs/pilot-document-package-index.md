# 파일럿 운영 문서 패키지 인덱스

이 문서는 **리더십 딜레마 365: 위기의 12주** 파일럿 운영자가 어떤 문서를 언제 보면 되는지 정리한 안내서입니다.

---

## 1. 먼저 볼 문서

| 순서 | 문서 | 용도 |
|---|---|---|
| 1 | `README.md` | 전체 구조와 route 확인 |
| 2 | `docs/pilot-final-rehearsal-runbook.md` | 파일럿 직전 최종 리허설 |
| 3 | `docs/pilot-final-qa-decision-table.md` | 운영 가능 여부 판정 |
| 4 | `docs/pilot-operator-handoff.md` | 운영자 인수인계 |
| 5 | `docs/expertise-index.md` | 전문성 고도화 구조 확인 |

---

## 2. 운영자 문서

| 목적 | 문서 |
|---|---|
| 운영 전체 흐름 | `docs/pilot-operator-handoff.md` |
| 최종 리허설 | `docs/pilot-final-rehearsal-runbook.md` |
| 운영 판정 | `docs/pilot-final-qa-decision-table.md` |
| 기본 동선 리허설 | `docs/pilot-rehearsal-script.md` |
| 파일럿 버전 요약 | `docs/release-notes-v1.0-pilot.md` |

---

## 3. 전문성 문서

| 목적 | 문서 |
|---|---|
| 전문성 전체 구조 | `docs/expertise-index.md` |
| 산출물 증거 수준 | `docs/evidence-review-keyword-policy.md` |
| 비밀 미션 전문성 기준 | `docs/secret-mission-expertise-evidence-policy.md` |
| 팀별 결과 카드 문장 | `docs/team-result-narrative-policy.md` |
| 누적 결과 해석 | `docs/cumulative-result-narrative-report-policy.md` |

---

## 4. 개발·QA 문서

| 목적 | 문서 |
|---|---|
| 전체 Week 밸런스 | `docs/all-week-balance-policy.md` |
| LOG 후폭풍 중복 방지 | `docs/playable-week-log-policy.md` |
| 리허설 샘플 검증 | `docs/rehearsal-scenario-balance-check.md` |
| 의존성 안정화 | `docs/dependency-stability-policy.md` |
| 의존성 변경 절차 | `docs/dependency-update-checklist.md` |

---

## 5. 파일럿 직전 10분 체크

시간이 부족하면 아래 두 문서만 봅니다.

```text
docs/pilot-final-rehearsal-runbook.md
docs/pilot-final-qa-decision-table.md
```

확인 순서는 다음입니다.

```text
방 생성
→ 리허설 샘플 생성
→ Admin QA 확인
→ 전문성 QA 확인
→ Report 다운로드
→ JSON 백업
→ 운영 가능 여부 기록
```

---

## 6. 문제 상황별 바로 볼 문서

| 문제 | 볼 문서 |
|---|---|
| 리허설 동선이 막힘 | `docs/pilot-final-rehearsal-runbook.md` |
| 운영 가능 여부가 애매함 | `docs/pilot-final-qa-decision-table.md` |
| 전문성 신호가 이상함 | `docs/evidence-review-keyword-policy.md` |
| 비밀 미션 점수가 낮음 | `docs/secret-mission-expertise-evidence-policy.md` |
| 결과 카드 문장이 어색함 | `docs/team-result-narrative-policy.md` |
| 리포트 경고 신호가 이해되지 않음 | `docs/cumulative-result-narrative-report-policy.md` |

---

## 7. 파일럿 후 남길 자료

```text
교육 리포트 Markdown
Admin QA 리포트 Markdown
JSON 백업 파일
최종 QA 판정 기록
강사 관찰 메모
참가자 반응 메모
수정 필요 문구 목록
```

---

## 8. 관리 원칙

- 운영자는 리허설 Runbook과 최종 QA 판정표를 우선 봅니다.
- 강사는 전문성 인덱스와 리포트 관련 문서를 봅니다.
- 개발자는 정책 문서와 QA 문서를 함께 봅니다.
- 파일럿 전에는 새 기능 추가보다 저장, 계산, 리포트, 백업 안정성을 우선합니다.
