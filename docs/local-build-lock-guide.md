# 로컬 빌드와 package-lock 안정화 가이드

이 문서는 **v1.0 Pilot**을 파일럿 운영 PC에서 재현 가능하게 설치·빌드하기 위한 가이드입니다.

현재 저장소는 Vercel 원격 빌드 성공으로 계속 확인되어 왔지만, 실제 파일럿 운영 전에는 운영 PC에서 직접 설치와 빌드를 확인해야 합니다.

---

## 1. 현재 상태

| 항목 | 상태 |
|---|---|
| package.json | 존재 |
| package-lock.json | 아직 없음 |
| Vercel 빌드 | 성공 확인 |
| GitHub Actions | `Pilot Verify` workflow 추가 |
| 로컬 npm build | 운영 PC에서 별도 확인 필요 |
| npm 설정 | `.npmrc` 추가 |
| Node 기준 | `package.json` engines에 Node 20 이상, 23 미만 명시 |

---

## 2. 처음 한 번 실행할 명령

파일럿 운영 PC에서 저장소를 받은 뒤 다음 순서로 실행합니다.

```bash
npm install
npm run pilot:verify
```

`npm install`을 실행하면 `package-lock.json`이 생성됩니다.

생성된 `package-lock.json`은 저장소에 커밋해 이후부터 같은 의존성으로 설치하도록 관리합니다.

---

## 3. package-lock 생성 후 표준 설치 명령

`package-lock.json`이 저장소에 커밋된 이후부터는 다음 명령을 표준으로 사용합니다.

```bash
npm ci
npm run pilot:verify
```

`npm ci`는 lock 파일 기준으로 설치하므로 파일럿 운영 PC와 배포 환경의 차이를 줄일 수 있습니다.

---

## 4. GitHub Actions 검증 기준

추가된 workflow는 다음입니다.

```text
.github/workflows/pilot-verify.yml
```

실행 조건은 다음입니다.

- `main` branch push
- `main` 대상 pull request
- 수동 실행

동작 기준은 다음입니다.

```text
package-lock.json이 있으면 npm ci 실행
package-lock.json이 없으면 npm install 실행
그 다음 npm run pilot:verify 실행
```

따라서 lock 파일이 커밋되기 전에도 빌드 검증이 가능하고, lock 파일이 커밋된 이후에는 자동으로 `npm ci` 기준으로 전환됩니다.

---

## 5. 권장 Node/npm 기준

현재 `package.json`에는 다음 기준이 있습니다.

```json
{
  "engines": {
    "node": ">=20.0.0 <23.0.0",
    "npm": ">=10.0.0"
  }
}
```

권장 운영 환경은 다음입니다.

- Node.js 20 LTS 또는 22 LTS
- npm 10 이상

파일럿 운영 PC에서는 아래 명령으로 버전을 확인합니다.

```bash
node -v
npm -v
```

---

## 6. 스크립트 기준

현재 파일럿 검증용 스크립트는 다음입니다.

```bash
npm run pilot:build
npm run pilot:verify
```

두 스크립트는 현재 모두 `vite build`를 실행합니다. 이름을 분리해 둔 이유는 후속 Sprint에서 lint, test, route smoke check 등을 `pilot:verify`에 추가할 수 있게 하기 위해서입니다.

---

## 7. 실패 시 우선 확인

### 7.1 설치 실패

1. Node 버전을 확인합니다.
2. npm 버전을 확인합니다.
3. 기존 `node_modules`를 삭제합니다.
4. lock 파일이 있다면 `npm ci`를 사용합니다.

```bash
rm -rf node_modules
npm ci
```

Windows에서는 `node_modules` 폴더를 직접 삭제한 뒤 다시 실행합니다.

### 7.2 빌드 실패

1. 오류가 난 파일명을 확인합니다.
2. 최근 추가된 컴포넌트 import 경로를 확인합니다.
3. 대소문자가 실제 파일명과 일치하는지 확인합니다.
4. Vercel 배포 상태와 로컬 오류가 다른지 비교합니다.

### 7.3 앱은 뜨지만 데이터가 이상함

1. `/admin/:roomId`로 이동합니다.
2. JSON 백업을 다운로드합니다.
3. `계산 모델 v2 데이터 보정`을 실행합니다.
4. `전체 재계산 + 최종 판정 재생성`을 실행합니다.
5. 계속 이상하면 현재 방 진행 데이터를 초기화합니다.

---

## 8. package-lock 커밋 기준

`package-lock.json`은 다음 조건을 만족할 때 커밋합니다.

- `npm install` 후 lock 파일이 생성됨
- `npm run pilot:verify` 성공
- GitHub Actions `Pilot Verify` 성공
- `/host/create`에서 방 생성 가능
- `/guide/:roomId`에서 파일럿 직전 기능 동선 점검표가 표시됨
- `/admin/:roomId`에서 QA 점검판이 표시됨
- `/report/:roomId`에서 교육 리포트 화면이 표시됨

---

## 9. 후속 안정화 과제

- `latest` 의존성의 실제 설치 버전을 package-lock으로 고정
- 필요 시 `package.json` dependency 버전을 exact로 전환
- lock 파일 커밋 후 CI가 `npm ci` 경로로 성공하는지 확인
- GitHub Release 또는 tag 생성
- 운영 PC별 Node 버전 표준화
