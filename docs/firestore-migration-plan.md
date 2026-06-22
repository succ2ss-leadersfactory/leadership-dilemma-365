# Firestore 전환 계획

현재 MVP는 localStorage 기반입니다. 여러 기기에서 동시에 같은 방을 운영하려면 Firestore 실시간 동기화가 필요합니다.

## 목표

- Host, Team, Player 화면이 같은 room 데이터를 실시간 공유한다.
- 참가자는 입장 코드로 방에 들어오고, 각자의 선택과 성찰을 저장한다.
- 강사는 Host 화면에서 라운드와 단계 진행을 제어한다.
- 교육 리포트와 다팀 비교는 Firestore 데이터를 읽어 즉시 갱신된다.

## 권장 컬렉션 구조

```text
rooms/{roomId}
rooms/{roomId}/players/{playerId}
rooms/{roomId}/teamDecisions/{decisionId}
rooms/{roomId}/submissions/{submissionId}
rooms/{roomId}/declarations/{teamId}
rooms/{roomId}/finalResults/{teamId}
rooms/{roomId}/events/{eventId}
```

## rooms 문서 예시

```json
{
  "roomId": "room_abc",
  "joinCode": "123456",
  "createdAt": 0,
  "roomProgress": {
    "currentRoundId": "week1",
    "currentPhase": "playerVote",
    "resultVisible": false,
    "isScreenLocked": false
  },
  "teams": {},
  "stateValues": {}
}
```

## 단계별 구현 순서

1. `.env.example`을 `.env.local`로 복사하고 Firebase 값을 입력한다.
2. `src/services/firebase.js`를 만들고 Firebase app, firestore를 초기화한다.
3. 현재 `storage.js`와 같은 함수 이름을 가진 `firestoreStorage.js`를 만든다.
4. `subscribe`, `readDb`, `updateDb` 호출부를 adapter로 감싼다.
5. `VITE_STORAGE_MODE=local|firestore` 값으로 저장소를 선택한다.
6. Host 권한과 참가자 권한을 분리한다.
7. Firestore security rules를 적용한다.
8. Vercel 환경변수에 Firebase 값을 등록한다.

## 첫 번째 전환 범위

처음부터 모든 기능을 실시간화하지 말고 아래 범위부터 전환합니다.

- room 생성
- roomProgress 실시간 구독
- players 입장/표시
- teamDecisions 저장
- submissions 저장
- declarations 저장
- finalResults 읽기

## 주의할 점

- Firestore는 비동기입니다. 현재 localStorage 기반 `readDb()` 패턴을 그대로 유지하기 어렵습니다.
- React 화면은 `subscribeRoom(roomId, callback)` 중심으로 바꾸는 것이 안전합니다.
- 교육장에서는 네트워크 장애 가능성이 있으므로 JSON 백업 기능은 유지하는 것이 좋습니다.
- Host PIN 또는 관리자 전용 링크가 없으면 참가자가 진행 상태를 바꿀 위험이 있습니다.

## MVP 이후 보강 과제

- 익명 인증 또는 간단한 참가자 세션
- Host PIN
- roomMembers 권한 구조
- event log 저장
- 방 복제 기능
- 교육 종료 후 room archive
