# v1.0 Pilot Release Candidate Checkpoint

이 문서는 **「리더십 딜레마 365: 위기의 12주」** v1.0 Pilot 릴리즈 후보 상태를 기록한 체크포인트입니다.

---

## 1. 체크포인트 기준

| 항목 | 값 |
|---|---|
| 90차 기준 커밋 | `b608e6c4f25f2c5930bea4fda26128a5a85bee66` |
| 91차 목적 | v1.0 Pilot 릴리즈 후보 문서화 |
| 92차 목적 | 로컬 빌드와 package-lock 안정화 준비 |
| Git 태그 | 아직 미생성 |
| 실제 파일럿 투입 | 로컬 `npm install` / `npm run pilot:verify` 확인 후 결정 |

---

## 2. 릴리즈 후보 상태

| 영역 | 상태 | 메모 |
|---|---|---|
| 앱 기능 | 후보 완료 | Round 0, Week 1~12, 결과 카드, 최종 판정 흐름 포함 |
| 계산 모델 v2 | 후보 완료 | 토의 품질, 산출물 품질, 영향도 TOP 3, 누적 리스크, 최종 게이트 포함 |
| 강사용 운영 기능 | 후보 완료 | Host, Guide, Admin, Report 화면 구성 완료 |
| 리허설 샘플 | 후보 완료 | 4개 시나리오와 밸런스 검증 포함 |
| 문서 패키지 | 후보 완료 | README, 운영자 패키지, 릴리즈 노트, 문서 인덱스 정리 |
| Vercel 배포 | 확인 필요 | 최종 HEAD 기준 Vercel 상태 확인 필요 |
| 로컬 빌드 | 미확인 | 파일럿 운영 PC에서 직접 확인 필요 |
| package-lock | 미생성 | 운영 PC에서 `npm install` 후 생성·커밋 필요 |

---

## 3. 파일럿 전 필수 확인

실제 파일럿 직전에는 아래 순서로 확인합니다.

```bash
npm install
npm run pilot:verify
```

`package-lock.json`이 생성된 뒤에는 다음 명령을 표준 설치 기준으로 전환합니다.

```bash
npm ci
npm run pilot:verify
```

---

## 4. 앱 동선 확인

`/guide/:roomId`의 **파일럿 직전 기능 동선 점검표**에서 한 팀 기준으로 P1~P9를 확인합니다.

```text
P1 방 생성과 Host 진입
P2 팀 화면과 KSA 저장
P3 Week 이동과 상황 표시
P4 팀 최종 선택 저장
P5 산출물 저장
P6 결과 계산 후 공개
P7 Week 12 선언문과 최종 판정
P8 교육 리포트 저장
P9 Admin QA와 초기화
```

---

## 5. 참가자에게 노출하지 않을 정보

아래 정보는 참가자에게 산식처럼 설명하지 않습니다.

- 팀별 비밀 미션 세부 기준
- 최종 게이트 내부 판단 기준
- 산출물 품질 계산 비중
- 누적 리스크 원점수
- 인물 카드별 리스크 보정 방식
- 라운드 영향도 TOP 3 계산 기준

강사용 리포트와 Admin 화면에는 남기되, 교육장에서는 질문으로 전환합니다.

---

## 6. 관련 문서

| 문서 | 용도 |
|---|---|
| `README.md` | 전체 구조와 실행 방법 |
| `docs/pilot-document-package-index.md` | 운영 문서 인덱스 |
| `docs/pilot-operator-package.md` | 파일럿 당일 운영 패키지 |
| `docs/release-notes-v1.0-pilot.md` | 릴리즈 노트 |
| `docs/local-build-lock-guide.md` | 로컬 빌드와 package-lock 안정화 기준 |

---

## 7. 후속 Sprint 권장 순서

1. 운영 PC에서 `npm install`과 `npm run pilot:verify` 실행
2. 생성된 `package-lock.json` 커밋
3. 이후 설치 기준을 `npm ci`로 전환
4. 필요 시 dependency 버전 exact 고정
5. Git tag 또는 GitHub Release 생성
6. Firestore adapter 설계
7. Host 권한/PIN 구조
8. 다중 기기 파일럿
9. PDF/docx 리포트 출력 강화
