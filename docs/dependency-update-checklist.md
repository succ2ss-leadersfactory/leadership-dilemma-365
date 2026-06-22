# 의존성 업데이트 체크리스트

이 문서는 `package.json`, `package-lock.json`, Node/npm, CI 빌드 기준을 바꿀 때 확인할 체크리스트입니다.

현재 프로젝트는 v1.0 Pilot 단계이므로, 교육장 파일럿 직전에는 의존성 변경을 최소화합니다.

---

## 1. 작업 전 확인

의존성 변경 전 아래를 확인합니다.

- 파일럿 일정이 임박하지 않았는가?
- 현재 main 브랜치 빌드가 성공 상태인가?
- 변경 목적이 분명한가?
- 기능 수정과 의존성 수정이 같은 커밋에 섞이지 않는가?
- 실패 시 이전 정상 커밋을 확인할 수 있는가?

---

## 2. 기본 확인 명령

작업 전후 아래 명령을 실행합니다.

```bash
node -v
npm -v
npm install
npm run build
```

빌드가 실패하면 의존성 문제인지, 최근 기능 코드 문제인지 먼저 나눠 봅니다.

---

## 3. package-lock.json 생성

현재 lock 파일이 없다면 먼저 lock 파일을 생성합니다.

```bash
npm install
npm run build
```

성공하면 `package.json`과 `package-lock.json`을 함께 커밋합니다.

권장 커밋 메시지:

```text
chore: lock npm dependencies
```

---

## 4. latest 제거 기준

`latest`를 제거할 때는 실제 설치와 빌드가 확인된 버전을 기준으로 합니다.

권장 순서:

1. `npm install` 실행
2. 설치된 버전 확인
3. `package.json`의 `latest` 교체
4. 다시 `npm install` 실행
5. `npm run build` 확인
6. CI 통과 확인

---

## 5. CI 전환 기준

`package-lock.json`이 생기면 CI는 다음 기준으로 전환합니다.

```text
npm install → npm ci
```

`npm ci`는 lock 파일 기준으로 설치하므로 파일럿 운영 전 빌드 재현성에 더 적합합니다.

---

## 6. 화면 확인

의존성 변경 후 최소한 아래 화면을 확인합니다.

- `/host/create`
- `/host/:roomId`
- `/join/:joinCode`
- `/player/:roomId/:playerId`
- `/team/:roomId/:teamId`
- `/admin/:roomId`
- `/report/:roomId`

Admin 화면에서는 리허설 샘플 생성과 QA 리포트 다운로드를 확인합니다.

---

## 7. 실패 시 확인 순서

빌드가 실패하면 아래 순서로 확인합니다.

1. 설치 단계 오류인지 빌드 단계 오류인지 확인
2. `package.json`과 lock 파일 정합성 확인
3. Node/npm 버전 확인
4. import 경로 오류 확인
5. React Router 관련 오류 확인
6. Vite 관련 오류 확인
7. Firebase import 오류 확인

---

## 8. 파일럿 전 완료 기준

파일럿 전에는 다음 상태를 목표로 합니다.

- main 브랜치 CI 통과
- Vercel 배포 성공
- 리허설 샘플 생성 성공
- QA 리포트 다운로드 성공
- 교육 리포트 다운로드 성공
- 20분 리허설 1회 완료
