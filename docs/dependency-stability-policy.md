# 의존성 안정화 정책

현재 프로젝트는 React + Vite 기반 MVP이며, `package.json`의 주요 의존성은 아직 `latest`로 지정되어 있습니다.

이 문서는 파일럿 운영 전후 의존성 관리 기준을 정리합니다.

---

## 1. 현재 상태

현재 `package.json`에는 다음 의존성이 있습니다.

```text
@vitejs/plugin-react
vite
react
react-dom
react-router-dom
firebase
```

현재 버전 지정 방식은 `latest`입니다.

---

## 2. 리스크

`latest`는 빠르게 실험하기에는 편하지만, 시간이 지나면 같은 코드라도 다른 버전이 설치될 수 있습니다.

그 결과 다음 문제가 생길 수 있습니다.

- 어제는 빌드됐지만 오늘은 빌드 실패
- React Router 또는 Vite major 변경에 따른 API 차이
- Firebase SDK 변경에 따른 import 오류
- 교육장 파일럿 직전 예상치 못한 설치 오류
- CI와 로컬 환경 결과 차이

---

## 3. v1.0 Pilot 기준

v1.0 Pilot에서는 다음 기준을 적용합니다.

```text
CI에서 npm install + npm run build를 실행한다.
package-lock.json이 없으므로 npm cache는 사용하지 않는다.
의존성 버전 고정은 파일럿 빌드 성공 기준이 확인된 뒤 수행한다.
```

즉, 지금 단계에서는 무리하게 버전을 임의 고정하지 않고, CI 통과 여부를 먼저 확인합니다.

---

## 4. package-lock.json 생성 기준

파일럿 전 안정화 시점에는 다음 순서로 lock 파일을 생성합니다.

```bash
npm install
npm run build
git add package-lock.json package.json
git commit -m "chore: lock npm dependencies"
```

lock 파일이 생성된 뒤에는 CI를 다음 기준으로 바꿉니다.

```bash
npm ci
npm run build
```

---

## 5. 버전 고정 기준

lock 파일 생성 후에는 `package.json`의 `latest`를 제거하고, 실제 설치·빌드가 검증된 major/minor range로 고정합니다.

권장 순서:

1. 로컬에서 `npm install` 실행
2. `package-lock.json` 생성 확인
3. `npm run build` 성공 확인
4. 설치된 버전을 기준으로 `package.json`의 `latest` 제거
5. CI를 `npm ci`로 변경
6. main push 후 CI 통과 확인

---

## 6. 운영 원칙

- 교육장 파일럿 직전에는 의존성 업데이트를 하지 않습니다.
- Vite, React, React Router, Firebase는 한 번에 모두 올리지 않습니다.
- major 버전 변경은 별도 브랜치에서 검증합니다.
- 빌드 실패가 나면 먼저 package-lock과 Node 버전을 확인합니다.
- 문서 수정만 있는 커밋이라도 CI 결과를 확인합니다.

---

## 7. 다음 작업 후보

- 실제 로컬 또는 GitHub Actions 환경에서 package-lock.json 생성
- CI를 npm install에서 npm ci로 전환
- package.json의 latest 제거
- Node 버전 기준 명시
- 의존성 업데이트 전용 체크리스트 추가
