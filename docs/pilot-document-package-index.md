# 파일럿 운영 문서 패키지 인덱스

이 문서는 `리더십 딜레마 365: 위기의 12주` v1.0 파일럿 운영에 필요한 문서를 빠르게 찾기 위한 인덱스입니다.

---

## 1. 가장 먼저 볼 문서

| 순서 | 문서 | 용도 |
|---|---|---|
| 1 | `README.md` | 전체 구조, 주요 route, 기본 운영 흐름 확인 |
| 2 | `docs/facilitator-pilot-runbook.md` | 파일럿 당일 강사용 진행 순서 확인 |
| 3 | `docs/pilot-ui-ux-qa-checklist.md` | 교육생 화면과 강사용 화면 노출 기준 확인 |
| 4 | `docs/pilot-final-status-summary.md` | 현재 v1.0 파일럿 운영 가능 상태 확인 |
| 5 | `docs/release-notes-v1.0-pilot.md` | 이번 배포본 포함 기능과 제한 사항 확인 |
| 6 | `docs/pilot-operator-handoff.md` | 운영자 인수인계 기준 확인 |

---

## 2. 파일럿 당일 운영 문서

| 필요 상황 | 문서 |
|---|---|
| 당일 운영 순서가 필요함 | `docs/facilitator-pilot-runbook.md` |
| 강사 멘트와 디브리핑 질문이 필요함 | `docs/facilitator-pilot-runbook.md` |
| 운영자에게 전체 흐름을 넘겨야 함 | `docs/pilot-operator-handoff.md` |
| 전체 route와 기능을 확인해야 함 | `README.md` |

---

## 3. 파일럿 전 점검 문서

| 필요 상황 | 문서 |
|---|---|
| UI/UX와 화면별 노출 기준 확인 | `docs/pilot-ui-ux-qa-checklist.md` |
| 20분 리허설 진행 | `docs/pilot-rehearsal-script.md` |
| 최종 운영 여부 판정 | `docs/pilot-final-qa-decision-table.md` |
| 리허설 샘플 밸런스 확인 | `docs/rehearsal-scenario-balance-check.md` |
| 현재 최종 상태 확인 | `docs/pilot-final-status-summary.md` |

---

## 4. 강사용 디브리핑 문서

| 필요 상황 | 문서 또는 화면 |
|---|---|
| 팀별 관찰과 개입 질문 확인 | `/guide/:roomId` |
| 최종 리포트 확인 | `/report/:roomId` |
| 팀별 판단 패턴 비교 | `/compare/:roomId` |
| 전문성 렌즈 구조 확인 | `docs/expertise-index.md` |
| 교육생/강사용 정보 분리 기준 확인 | `docs/pilot-ui-ux-qa-checklist.md` |
| 운영 직후 회고 기록 작성 | `docs/pilot-post-run-retrospective-template.md` |

---

## 5. 전문성·판정 정책 문서

| 목적 | 문서 |
|---|---|
| 전문성 전체 구조 | `docs/expertise-index.md` |
| 산출물 증거 수준 | `docs/evidence-review-keyword-policy.md` |
| 비밀 미션 전문성 기준 | `docs/secret-mission-expertise-evidence-policy.md` |
| 팀별 결과 카드 문장 | `docs/team-result-narrative-policy.md` |
| 누적 결과 해석 | `docs/cumulative-result-narrative-report-policy.md` |
| 전체 Week 밸런스 | `docs/all-week-balance-policy.md` |
| PLAY Week와 LOG 정책 | `docs/playable-week-log-policy.md` |

---

## 6. 개발·운영 안정화 문서

| 목적 | 문서 |
|---|---|
| 의존성 안정화 | `docs/dependency-stability-policy.md` |
| 의존성 변경 절차 | `docs/dependency-update-checklist.md` |
| Firestore 전환 계획 | `docs/firestore-migration-plan.md` |
| 개발 안정화 체크 | `docs/pilot-dev-stability-checklist.md` |

---

## 7. 파일럿 전 최종 확인 순서

```text
README.md
→ docs/facilitator-pilot-runbook.md
→ docs/pilot-ui-ux-qa-checklist.md
→ docs/pilot-rehearsal-script.md
→ docs/pilot-final-qa-decision-table.md
→ docs/pilot-final-status-summary.md
```

---

## 8. 파일럿 종료 후 확인 문서

| 필요 상황 | 문서 |
|---|---|
| 운영 직후 회고를 남겨야 함 | `docs/pilot-post-run-retrospective-template.md` |
| 다음 파일럿 전 고칠 점을 정리해야 함 | `docs/pilot-post-run-retrospective-template.md` |
| 판정 밸런스 조정 근거가 필요함 | `docs/pilot-post-run-retrospective-template.md`, `docs/all-week-balance-policy.md` |

---

## 9. 관리 원칙

- 운영자는 README, 파일럿 운영자 런북, UI/UX QA 체크리스트를 우선 봅니다.
- 강사는 운영자 런북, 강사 가이드, 교육 리포트, 전문성 인덱스를 함께 봅니다.
- 개발자는 정책 문서와 QA 문서를 함께 봅니다.
- 파일럿 종료 후에는 회고 템플릿을 기준으로 다음 개선 항목을 남깁니다.
- 파일럿 전에는 새 기능 추가보다 저장, 계산, 리포트, 백업 안정성을 우선합니다.
