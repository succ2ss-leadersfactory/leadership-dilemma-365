#!/usr/bin/env python3
"""과정 작업 기록(status.md) 도구.

슬래시 명령(/새과정, /단계, /수정, /승인, /검토, /내보내기)이 이 도구로
단계 상태를 확인하고 기록한다. 상태를 AI가 눈으로 읽고 판단하지 않도록,
승인 여부 확인·승인 기록·이전 판 보관을 모두 여기서 한다.

쓰는 법 (저장소 맨 위 폴더에서)
  python3 tools/status.py new <과정이름>          과정 폴더, 00_요청.md, status.md 만들기
  python3 tools/status.py current [<과정이름>]    지금 과정 보기 / 바꾸기
  python3 tools/status.py show                    단계 상태 보기
  python3 tools/status.py check <단계>            /단계 실행 전 확인 (멈춰야 하면 종료 코드 2)
  python3 tools/status.py mark <단계> <생성|회신반영|수정> <메모>
  python3 tools/status.py approve <단계>          승인 시각 기록
  python3 tools/status.py archive <단계|2b>       고치기 전 판을 _v1, _v2 ... 로 보관
  python3 tools/status.py review-path <단계>      다음 검토 파일 경로
  python3 tools/status.py log <메모>              수정 이력에 한 줄 추가
  python3 tools/status.py now                     지금 시각(서울)

<과정이름>은 courses/ 아래 경로다. 예: 가상제약_신임팀장, _시험/가상제약_신임팀장
모든 명령에 --course <과정이름>을 붙이면 지금 과정 대신 그 과정을 쓴다.
"""
import argparse
import datetime
import os
import re
import shutil
import sys

try:
    from zoneinfo import ZoneInfo
    TZ = ZoneInfo("Asia/Seoul")
except Exception:  # pragma: no cover
    TZ = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COURSES = os.path.join(ROOT, "courses")
CURRENT_FILE = os.path.join(COURSES, "현재과정.txt")

# 단계, 이름, 산출물 파일, 앞 단계
STAGES = [
    ("1", "요구 분석", ["01_과정브리프.md"], []),
    ("2", "고객 확인 요청", ["02_확인요청서.md", "02b_회신반영.md"], ["1"]),
    ("3-1", "유형·무대 제안", ["03_구조안.md"], ["1", "2"]),
    ("3-2", "커리큘럼표", ["04_커리큘럼표.md"], ["1", "2", "3-1"]),
]
STAGE_IDS = [s[0] for s in STAGES]
STATES = ["시작 전", "초안", "승인", "앞 단계 바뀜"]
REPLY_FILE = "03_고객회신.md"
REQUEST_FILE = "00_요청.md"

REQUEST_TEMPLATE = """# 과정 요청: {name}

빈칸을 채운 뒤 `/단계 1`을 부르세요. 모르는 칸은 비워 두면 브리프에 [확인 필요]로 남습니다.
개인정보와 대외비는 빼고 적습니다.

## 고객사

## 업종

## 대상
(예: 신임 팀장)

## 인원
(예: 30명, 6개 조)

## 교육 시간·형식
(예: 4시간, 집합 1회, 13:00–17:00)

## 요청 비중
(예: 강의:실습 5:5)

## AI 실습 환경
(예: 개인 노트북, 무료 ChatGPT·Claude / 실습앱 / AI 불가)

## 주제와 고객이 말한 문제
(고객 담당자가 한 말을 그대로 적어 주세요. 길어도 됩니다.)

## 고객이 준 자료
(제도 설명, 지난 과정 평가, 진단 결과 요약 등을 붙여 넣거나 같은 폴더의 파일 이름을 적습니다.)

## 설계자 메모
(꼭 넣을 것, 피할 것, 쓰고 싶은 무대나 장치)
"""

REQUEST_FIELDS = ["고객사", "업종", "대상", "인원", "교육 시간·형식", "요청 비중",
                  "AI 실습 환경", "주제와 고객이 말한 문제", "고객이 준 자료", "설계자 메모"]


def now():
    t = datetime.datetime.now(TZ) if TZ else datetime.datetime.now()
    return t.strftime("%Y-%m-%d %H:%M")


def fail(msg, code=1):
    print(msg)
    sys.exit(code)


def course_dir(name):
    name = name.strip().strip("/")
    if name.startswith("courses/"):
        name = name[len("courses/"):]
    return os.path.join(COURSES, name)


def rel(path):
    return os.path.relpath(path, ROOT)


def resolve_course(args):
    if getattr(args, "course", None):
        d = course_dir(args.course)
    else:
        if not os.path.exists(CURRENT_FILE):
            fail("지금 과정이 정해져 있지 않습니다. /새과정 <과정이름>으로 만들거나 /과정 <과정이름>으로 고르세요.")
        name = open(CURRENT_FILE, encoding="utf-8").read().strip()
        d = course_dir(name)
    if not os.path.isdir(d):
        fail(f"과정 폴더가 없습니다: {rel(d)}")
    return d


def stage_info(sid):
    for s in STAGES:
        if s[0] == sid:
            return s
    fail(f"단계는 {', '.join(STAGE_IDS)} 중 하나여야 합니다. 받은 값: {sid}")


def norm_stage(sid):
    sid = sid.strip().replace("단계", "")
    if sid in ("3a", "3-a"):
        sid = "3-1"
    if sid in ("3b", "3-b"):
        sid = "3-2"
    return sid


# ---------- status.md 읽기·쓰기 ----------

ROW_RE = re.compile(r"^\|\s*(1|2|3-1|3-2)\s*\|(.*)\|\s*$")


def status_path(d):
    return os.path.join(d, "status.md")


def read_status(d):
    p = status_path(d)
    if not os.path.exists(p):
        fail(f"status.md가 없습니다: {rel(p)}")
    lines = open(p, encoding="utf-8").read().split("\n")
    rows = {}
    for line in lines:
        m = ROW_RE.match(line)
        if m:
            cells = [c.strip() for c in m.group(2).split("|")]
            # 이름 | 상태 | 승인 시각 | 산출물
            rows[m.group(1)] = {"name": cells[0], "state": cells[1],
                                "approved": cells[2], "files": cells[3] if len(cells) > 3 else ""}
    for sid in STAGE_IDS:
        if sid not in rows:
            fail(f"status.md 표에서 {sid}단계 줄을 찾지 못했습니다. 표 모양을 고쳐 주세요.")
    return lines, rows


def stage_files_present(d, sid):
    return [f for f in stage_info(sid)[2] if os.path.exists(os.path.join(d, f))]


def write_status(d, lines, rows, log_line=None):
    out = []
    for line in lines:
        m = ROW_RE.match(line)
        if m:
            sid = m.group(1)
            r = rows[sid]
            files = ", ".join(stage_files_present(d, sid)) or "-"
            out.append(f"| {sid} | {r['name']} | {r['state']} | {r['approved'] or '-'} | {files} |")
        else:
            out.append(line)
    text = "\n".join(out).rstrip("\n") + "\n"
    if log_line:
        text += f"- {now()} · {log_line}\n"
    with open(status_path(d), "w", encoding="utf-8") as f:
        f.write(text)


def new_status_text(name, d):
    rows = "\n".join(f"| {s[0]} | {s[1]} | 시작 전 | - | - |" for s in STAGES)
    return f"""# 작업 기록: {name}

- 과정 폴더: {rel(d)}
- 상태 값: 시작 전 · 초안 · 승인 · 앞 단계 바뀜
- 승인은 설계자가 채팅에서 "승인"이라고 말할 때(/승인)만 기록한다.
- 이 파일은 tools/status.py가 고친다. 손으로 고칠 때는 표 모양을 유지한다.

## 단계 상태

| 단계 | 이름 | 상태 | 승인 시각 | 산출물 |
| --- | --- | --- | --- | --- |
{rows}

## 수정 이력

- {now()} · 과정 폴더 만듦
"""


def current_output(d, sid):
    """다음 단계가 '승인된 산출물'로 읽을 파일. 2단계는 회신 반영본이 있으면 그것."""
    present = stage_files_present(d, sid)
    if sid == "2" and "02b_회신반영.md" in present:
        return "02b_회신반영.md"
    return present[0] if present else None


def request_filled(d):
    p = os.path.join(d, REQUEST_FILE)
    if not os.path.exists(p):
        return False, []
    text = open(p, encoding="utf-8").read()
    filled = []
    for i, field in enumerate(REQUEST_FIELDS):
        m = re.search(r"^## " + re.escape(field) + r"\s*$(.*?)(?=^## |\Z)", text, re.M | re.S)
        if not m:
            continue
        body = re.sub(r"^\(.*\)[ \t]*$", "", m.group(1).strip(), flags=re.M).strip()
        if body:
            filled.append(field)
    return True, filled


# ---------- 명령 ----------

def cmd_new(args):
    d = course_dir(args.name)
    if os.path.exists(os.path.join(d, REQUEST_FILE)) or os.path.exists(status_path(d)):
        fail(f"이미 있는 과정입니다: {rel(d)} (덮어쓰지 않았습니다)")
    os.makedirs(d, exist_ok=True)
    name = os.path.basename(d)
    with open(os.path.join(d, REQUEST_FILE), "w", encoding="utf-8") as f:
        f.write(REQUEST_TEMPLATE.format(name=name))
    with open(status_path(d), "w", encoding="utf-8") as f:
        f.write(new_status_text(name, d))
    set_current(d)
    print(f"만듦: {rel(d)}/{REQUEST_FILE}")
    print(f"만듦: {rel(d)}/status.md")
    print(f"지금 과정: {rel(d)}")


def set_current(d):
    os.makedirs(COURSES, exist_ok=True)
    with open(CURRENT_FILE, "w", encoding="utf-8") as f:
        f.write(os.path.relpath(d, COURSES) + "\n")


def cmd_current(args):
    if args.name:
        d = course_dir(args.name)
        if not os.path.exists(status_path(d)):
            fail(f"과정이 없습니다: {rel(d)}")
        set_current(d)
    d = resolve_course(args)
    print(f"지금 과정: {rel(d)}")


def cmd_show(args):
    d = resolve_course(args)
    _, rows = read_status(d)
    print(f"과정: {rel(d)}")
    for sid in STAGE_IDS:
        r = rows[sid]
        print(f"- {sid} {r['name']}: {r['state']}" + (f" (승인 {r['approved']})" if r['approved'] not in ("", "-") else ""))


def cmd_check(args):
    d = resolve_course(args)
    sid = norm_stage(args.stage)
    info = stage_info(sid)
    _, rows = read_status(d)
    problems = []
    for need in info[3]:
        if rows[need]["state"] != "승인":
            problems.append(f"{need}단계({rows[need]['name']})가 승인되지 않았습니다. 지금 상태: {rows[need]['state']}")
    exists, filled = request_filled(d)
    if not exists:
        problems.append(f"{REQUEST_FILE}이 없습니다.")
    elif sid == "1" and "주제와 고객이 말한 문제" not in filled:
        problems.append(f"{REQUEST_FILE}의 '주제와 고객이 말한 문제' 칸이 비어 있습니다.")

    mode = "생성"
    output = info[2][0]
    present = stage_files_present(d, sid)
    if sid == "2":
        has_reply = os.path.exists(os.path.join(d, REPLY_FILE))
        if "02_확인요청서.md" in present:
            if has_reply and "02b_회신반영.md" not in present:
                mode, output = "회신반영", "02b_회신반영.md"
            elif "02b_회신반영.md" in present:
                problems.append("02_확인요청서.md와 02b_회신반영.md가 이미 있습니다. 고치려면 /수정 2b <요청>을 쓰세요.")
            else:
                problems.append(f"02_확인요청서.md가 이미 있습니다. 고객 회신을 받았으면 {REPLY_FILE}에 붙여 넣고 다시 부르세요. 고치려면 /수정 2 <요청>.")
    elif present:
        problems.append(f"{present[0]}이 이미 있습니다. 고치려면 /수정 {sid} <요청>을 쓰세요.")

    if problems:
        print("멈춤")
        for p in problems:
            print(f"- {p}")
        sys.exit(2)

    inputs = [REQUEST_FILE]
    for need in info[3]:
        o = current_output(d, need)
        if o:
            inputs.append(o)
    if mode == "회신반영":
        inputs += ["02_확인요청서.md", REPLY_FILE]
    print("진행")
    print(f"과정 폴더: {rel(d)}")
    print(f"단계: {sid} {info[1]}")
    print(f"방식: {mode}")
    print(f"읽을 파일: {', '.join(dict.fromkeys(inputs))}")
    print(f"쓸 파일: {output}")


def mark_downstream(rows, sid):
    changed = []
    idx = STAGE_IDS.index(sid)
    for later in STAGE_IDS[idx + 1:]:
        if rows[later]["state"] in ("초안", "승인", "앞 단계 바뀜"):
            if rows[later]["state"] != "앞 단계 바뀜":
                changed.append(later)
            rows[later]["state"] = "앞 단계 바뀜"
            rows[later]["approved"] = "-"
    return changed


def cmd_mark(args):
    d = resolve_course(args)
    sid = norm_stage(args.stage)
    if sid == "2b":
        sid = "2"
    info = stage_info(sid)
    if not stage_files_present(d, sid):
        fail(f"{sid}단계 산출물 파일이 없어 기록하지 않았습니다.")
    lines, rows = read_status(d)
    was = rows[sid]["state"]
    rows[sid]["state"] = "초안"
    rows[sid]["approved"] = "-"
    changed = mark_downstream(rows, sid)
    note = f"{sid}단계 · {args.kind} · {args.note}"
    if was == "승인":
        note += " · 승인 풀림"
    if changed:
        note += f" · 뒤 단계 {', '.join(changed)} 앞 단계 바뀜"
    write_status(d, lines, rows, note)
    print(f"기록: {note}")


def cmd_approve(args):
    d = resolve_course(args)
    sid = norm_stage(args.stage)
    info = stage_info(sid)
    lines, rows = read_status(d)
    if not stage_files_present(d, sid):
        fail(f"멈춤\n- {sid}단계 산출물이 아직 없습니다. 먼저 /단계 {sid}를 부르세요.")
    for need in info[3]:
        if rows[need]["state"] != "승인":
            fail(f"멈춤\n- 앞 단계 {need}단계가 승인되지 않았습니다(지금: {rows[need]['state']}). 앞 단계부터 승인하세요.")
    if rows[sid]["state"] == "승인":
        fail(f"{sid}단계는 이미 승인되어 있습니다({rows[sid]['approved']}).")
    was = rows[sid]["state"]
    t = now()
    rows[sid]["state"] = "승인"
    rows[sid]["approved"] = t
    note = f"{sid}단계 · 승인 ({current_output(d, sid)})"
    if was == "앞 단계 바뀜":
        note += " · 앞 단계 바뀐 뒤 고치지 않고 승인"
    write_status(d, lines, rows, note)
    print(f"승인 기록: {sid}단계 {t}")


def cmd_archive(args):
    d = resolve_course(args)
    sid = norm_stage(args.stage)
    if sid == "2b":
        fname = "02b_회신반영.md"
    else:
        fname = stage_info(sid)[2][0]
    src = os.path.join(d, fname)
    if not os.path.exists(src):
        fail(f"보관할 파일이 없습니다: {rel(src)}")
    base = fname[:-3]
    n = 1
    while os.path.exists(os.path.join(d, f"{base}_v{n}.md")):
        n += 1
    dst = os.path.join(d, f"{base}_v{n}.md")
    shutil.copy2(src, dst)
    print(f"보관: {rel(dst)}")
    print(f"고쳐 쓸 파일: {rel(src)}")


def cmd_review_path(args):
    d = resolve_course(args)
    sid = norm_stage(args.stage)
    if sid != "2b":
        stage_info(sid)
    n = 1
    while os.path.exists(os.path.join(d, f"review_{sid}_{n}.md")):
        n += 1
    print(rel(os.path.join(d, f"review_{sid}_{n}.md")))


def cmd_log(args):
    d = resolve_course(args)
    lines, rows = read_status(d)
    write_status(d, lines, rows, args.note)
    print("기록함")


def main():
    p = argparse.ArgumentParser(description="과정 작업 기록 도구")
    p.add_argument("--course", help="courses/ 아래 과정 경로")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("new"); s.add_argument("name"); s.set_defaults(f=cmd_new)
    s = sub.add_parser("current"); s.add_argument("name", nargs="?"); s.set_defaults(f=cmd_current)
    s = sub.add_parser("show"); s.set_defaults(f=cmd_show)
    s = sub.add_parser("check"); s.add_argument("stage"); s.set_defaults(f=cmd_check)
    s = sub.add_parser("mark"); s.add_argument("stage"); s.add_argument("kind"); s.add_argument("note", nargs="?", default=""); s.set_defaults(f=cmd_mark)
    s = sub.add_parser("approve"); s.add_argument("stage"); s.set_defaults(f=cmd_approve)
    s = sub.add_parser("archive"); s.add_argument("stage"); s.set_defaults(f=cmd_archive)
    s = sub.add_parser("review-path"); s.add_argument("stage"); s.set_defaults(f=cmd_review_path)
    s = sub.add_parser("log"); s.add_argument("note"); s.set_defaults(f=cmd_log)
    s = sub.add_parser("now"); s.set_defaults(f=lambda a: print(now()))
    args = p.parse_args()
    args.f(args)


if __name__ == "__main__":
    main()
