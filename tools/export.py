#!/usr/bin/env python3
"""과정 설계 묶음 만들기 (/내보내기).

courses/<과정>/ 안의 단계 산출물을 순서대로 한 파일
<과정이름>_과정설계.md 로 묶는다. 단계마다 승인/초안 표시를 달고,
맨 끝에 status.md의 작업 기록과 검토 파일 목록을 붙인다.
파일 내용은 고치지 않고 그대로 옮긴다.

쓰는 법
  python3 tools/export.py                 지금 과정
  python3 tools/export.py --course <과정>  다른 과정
  python3 tools/export.py --force          이미 있는 묶음 파일을 덮어쓸 때(이전 파일은 _v1, _v2로 보관)
"""
import argparse
import glob
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import status as st  # noqa: E402

PARTS = [
    ("0", "과정 요청", "00_요청.md", None),
    ("1", "1단계 · 요구 분석 (과정 브리프)", "01_과정브리프.md", "1"),
    ("2", "2단계 · 고객 확인 요청 (확인 요청서)", "02_확인요청서.md", "2"),
    ("2r", "2단계 · 고객 회신 원문", "03_고객회신.md", "2"),
    ("2b", "2단계 · 고객 회신 반영", "02b_회신반영.md", "2"),
    ("3-1", "3-1단계 · 유형·무대 제안 (구조안)", "03_구조안.md", "3-1"),
    ("3-2", "3-2단계 · 커리큘럼표", "04_커리큘럼표.md", "3-2"),
]


def shift_headings(text):
    """산출물의 # 제목을 한 단계씩 내려 묶음 문서의 목차를 지킨다. 코드 블록은 그대로."""
    out, fence = [], False
    for line in text.split("\n"):
        if line.strip().startswith("```"):
            fence = not fence
        if not fence and re.match(r"^#{1,5}\s", line):
            line = "#" + line
        out.append(line)
    return "\n".join(out).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--course")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    d = st.resolve_course(a)
    _, rows = st.read_status(d)
    name = os.path.basename(d)
    target = os.path.join(d, f"{name}_과정설계.md")
    if os.path.exists(target):
        if not a.force:
            print(f"멈춤\n- {st.rel(target)}이 이미 있습니다. 덮어쓰려면 --force (이전 파일은 _v 번호로 보관)")
            sys.exit(2)
        n = 1
        while os.path.exists(target[:-3] + f"_v{n}.md"):
            n += 1
        shutil.copy2(target, target[:-3] + f"_v{n}.md")
        print(f"보관: {st.rel(target[:-3] + f'_v{n}.md')}")

    lines = [f"# {name} 과정설계", "", f"- 만든 시각: {st.now()}", f"- 과정 폴더: {st.rel(d)}", ""]
    lines += ["## 단계 상태", "", "| 단계 | 이름 | 상태 | 승인 시각 |", "| --- | --- | --- | --- |"]
    for sid in st.STAGE_IDS:
        r = rows[sid]
        lines.append(f"| {sid} | {r['name']} | {r['state']} | {r['approved'] or '-'} |")
    lines.append("")
    missing = []
    for key, title, fname, sid in PARTS:
        p = os.path.join(d, fname)
        if not os.path.exists(p):
            if key not in ("2r", "2b"):
                missing.append(fname)
            continue
        if sid is None:
            label = "입력"
        else:
            state = rows[sid]["state"]
            label = "승인" if state == "승인" else ("초안 · 앞 단계 바뀜" if state == "앞 단계 바뀜" else "초안")
            if state == "승인":
                label += f" {rows[sid]['approved']}"
        lines += [f"## {title} [{label}]", "", f"원본 파일: `{fname}`", ""]
        lines.append(shift_headings(open(p, encoding="utf-8").read()))
        lines.append("")
    if missing:
        lines += ["## 아직 없는 산출물", ""] + [f"- {m}" for m in missing] + [""]

    lines += ["## 작업 기록", ""]
    stext = open(st.status_path(d), encoding="utf-8").read()
    m = re.search(r"^## 수정 이력\s*\n(.*)", stext, re.M | re.S)
    lines.append(m.group(1).strip() if m else "(수정 이력 없음)")
    lines.append("")
    reviews = sorted(glob.glob(os.path.join(d, "review_*.md")))
    versions = sorted(glob.glob(os.path.join(d, "*_v[0-9]*.md")))
    lines += ["## 검토 파일과 이전 판", ""]
    lines += [f"- 검토: `{os.path.basename(x)}`" for x in reviews] or ["- 검토: 없음"]
    lines += [f"- 이전 판: `{os.path.basename(x)}`" for x in versions if not os.path.basename(x).startswith(name + "_과정설계")] or ["- 이전 판: 없음"]
    lines.append("")

    with open(target, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    st_lines, st_rows = st.read_status(d)
    st.write_status(d, st_lines, st_rows, f"내보내기 · {os.path.basename(target)}")
    print(f"만듦: {st.rel(target)}")


if __name__ == "__main__":
    main()
