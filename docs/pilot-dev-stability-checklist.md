# 파일럿 전 개발 안정화 체크리스트

이 문서는 **리더십 딜레마 365: 위기의 12주** 파일럿 운영 직전에 개발자가 확인해야 할 안정화 항목을 정리한 체크리스트입니다.

기능 추가보다 아래 네 가지를 우선합니다.

```text
빌드
배포
데이터 백업
리허설 샘플
```

---

## 1. v1.0 파일럿 후보 안정화 기준

현재 main 브랜치는 v1.0 파일럿 후보 상태로 봅니다.

파일럿 전에는 새 기능 추가보다 아래 기준을 우선합니다.

```text
저장 안정성
결과 계산 안정성
리포트 생성
JSON 백업
강사용 진행 가능성
```

파일럿 전 허용 변경은 아래로 제한합니다.

```text
오탈자 수정
강사용 문구 보정
문서 보정
QA 체크리스트 보강
명백한 저장/계산/리포트 오류 수정
```

아래 변경은 파일럿 이후로 미룹니다.

```text
새 라운드 추가
새 팀 추가
새 상태값 추가
점수 체계 대규모 변경
화면 구조 대폭 변경
의존성 major 업데이트
localStorage key 변경
```

---

## 2. 현재 개발 상태

현재 `package.json` 기준 스크립트는 다음과 같습니다.

```text
npm run dev
npm run build
npm run preview
```

현재 CI는 Node 20에서 아래 순서로 실행됩니다.

```text
npm install
npm run build
```

현재 의존성은 아직 `latest` 기반입니다.

---

## 3. 파일럿 전 필수 확인

| 항목 | 확인 방법 | 정상 기준 | 보류 기준 |
|---|---|---|---|
| 로컬 설치 | `npm install` | 설치 성공 | dependency 오류 |
| 로컬 빌드 | `npm run build` | build 성공 | build 실패 |
| 로컬 미리보기 | `npm run preview` | 주요 route 접속 가능 | 화면 진입 불가 |
| GitHub Actions | CI workflow 확인 | main build 성공 | 실패 원인 미해결 |
| 배포 | Vercel 또는 배포 URL 확인 | 최신 main 반영 | 이전 버전 유지 |
| localStorage 초기화 | 새 방 생성 | 방 생성 정상 | 기존 데이터 충돌 |
| JSON 백업 | Admin에서 백업 다운로드 | 파일 다운로드 | 백업 실패 |
| 리허설 샘플 | Admin 샘플 생성 | 4종 중 1개 이상 정상 | 샘플 생성 실패 |
| 전문성 QA | Admin QA 확인 | 렌즈·증거·결과해석 표시 | 전문성 데이터 누락 |
| 리포트 | Report 다운로드 | Markdown 저장 | 리포트 생성 실패 |

---

## 4. package-lock.json 결정 기준

현재는 `package-lock.json` 없이 `npm install`로 CI를 실행합니다.

파일럿 직전 안정화가 필요하면 아래 순서로 lock 파일을 생성합니다.

```bash
npm install
npm run build
git add package-lock.json package.json
git commit -m "chore: lock npm dependencies"
```

lock 파일 생성 후에는 CI를 다음 방식으로 바꾸는 것을 검토합니다.

```bash
npm ci
npm run build
```

단, 파일럿 하루 전에는 lock 파일과 의존성 변경을 새로 시도하지 않습니다.

---

## 5. 배포 확인 기준

배포 URL에서 아래 route를 확인합니다.

```text
/
/host/create
/admin/:roomId
/guide/:roomId
/report/:roomId
```

확인 기준은 다음입니다.

- 첫 화면이 열린다.
- 방 생성이 된다.
- Admin QA 화면이 열린다.
- Guide 화면에서 전문성 렌즈가 보인다.
- Report 화면에서 다운로드가 된다.

---

## 6. localStorage 점검

이 앱은 브라우저 `localStorage`를 사용합니다.

파일럿 전에는 아래를 확인합니다.

```text
기존 테스트 방이 남아 있는가?
새 방 생성이 정상인가?
기본 콘텐츠 초기화 후 전문성 데이터가 살아 있는가?
JSON 백업과 가져오기가 가능한가?
```

기존 데이터가 꼬였다고 판단되면 새 방을 만들고, 필요한 경우 브라우저 저장 데이터를 초기화합니다.

---

## 7. 리허설 샘플 점검

Admin 화면의 리허설 샘플은 최소 1개 이상 정상 생성되어야 합니다.

권장 확인 순서:

```text
미션 성공형
에이스 과부하형
전면 재편형
보수적 생존형
```

시간이 부족하면 `미션 성공형`과 `에이스 과부하형`만 먼저 확인합니다.

정상 기준:

- 팀별 최종 판정이 생성된다.
- 결과 카드가 비어 있지 않다.
- 전문성 QA 수치가 채워진다.
- 리포트가 생성된다.

---

## 8. 운영 전 금지 사항

파일럿 직전에는 아래 작업을 하지 않습니다.

```text
의존성 major 업데이트
화면 구조 대폭 변경
결과 계산 로직 대규모 수정
localStorage key 변경
seed 데이터 대량 교체
```

필요한 수정은 문구 보정, 문서 보정, 작은 QA 보정 수준으로 제한합니다.

---

## 9. 최종 개발 안정화 기록 양식

```text
점검일:
점검자:
브랜치:
커밋 SHA:

npm install: 성공 / 실패 / 미실행
npm run build: 성공 / 실패 / 미실행
npm run preview: 성공 / 실패 / 미실행
GitHub Actions: 성공 / 실패 / 미확인
배포 URL 확인: 성공 / 실패 / 미확인
localStorage 새 방 생성: 성공 / 실패
JSON 백업 다운로드: 성공 / 실패
리허설 샘플 생성: 성공 / 실패
전문성 QA 확인: 성공 / 실패
Report 다운로드: 성공 / 실패

최종 개발 안정화 판정: 운영 가능 / 조건부 가능 / 보류
남은 조치:
```

---

## 10. 관련 문서

| 문서 | 용도 |
|---|---|
| `docs/dependency-stability-policy.md` | 의존성 안정화 기준 |
| `docs/dependency-update-checklist.md` | 의존성 변경 절차 |
| `docs/pilot-final-rehearsal-runbook.md` | 최종 리허설 실행 |
| `docs/pilot-final-qa-decision-table.md` | 운영 가능 여부 판정 |
| `docs/pilot-document-package-index.md` | 문서 패키지 인덱스 |
