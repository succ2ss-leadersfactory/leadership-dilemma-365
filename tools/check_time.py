#!/usr/bin/env python3
"""커리큘럼표 시간 검산 도구.

04_커리큘럼표.md의 "## 커리큘럼표" 표에서 블록별 시간(시작–끝)을 읽어
아래를 출력한다. AI가 시간을 암산하지 않도록 structure-designer가 3-2 작성 뒤
반드시 실행하고, 출력을 "## 시간 검산"에 그대로 붙인다.

  - 블록별 분과 합계(더한 식 포함)
  - 빈 시간, 겹치는 시간
  - 총 교육 시간과의 차이
  - 강의 분 · 실습 분 · 휴식 분과 강의:실습 비율
  - "분해 시간" 칸의 앞 숫자와 실제 블록 분이 다른 곳, 분해 숫자의 합이 맞지 않는 곳

쓰는 법
  python3 tools/check_time.py courses/<과정>/04_커리큘럼표.md
  python3 tools/check_time.py <파일> --total 240     총 교육 시간(분)을 직접 줄 때

총 교육 시간은 --total이 없으면 같은 파일 "## 과정 개요"의 "총 시간" 줄에서,
그것도 없으면 같은 폴더 00_요청.md의 "교육 시간·형식"에서 읽는다.

구분 규칙(방식 칸 기준)
  휴식: 블록이나 방식에 "휴식", "점심", "쉬는"이 있음
  실습: 방식에 실습·개인·짝·조 중 하나가 있음
  강의: 방식이 "전체"(위 둘이 아님)
  기타: 그 밖
여러 날 과정은 시간 칸이나 블록 칸에 "Day 2", "2일차"를 적으면 날을 나눠 계산한다.

종료 코드: 문제가 없으면 0, 차이·빈 시간·겹침·분해 불일치가 있으면 1, 표를 못 읽으면 2.
"""
import argparse
import os
import re
import sys

TIME_RE = re.compile(r"(\d{1,2})\s*[:：]\s*(\d{2})\s*[–—―\-~〜]+\s*(\d{1,2})\s*[:：]\s*(\d{2})")
DAY_RE = re.compile(r"(?:Day\s*(\d+)|(\d+)\s*일차)", re.I)


def section(text, title_pattern):
    m = re.search(r"^##\s*" + title_pattern + r"[^\n]*\n(.*?)(?=^##\s|\Z)", text, re.M | re.S)
    return m.group(1) if m else None


def split_row(line):
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|"):
        line = line[:-1]
    return [c.strip() for c in line.split("|")]


def plain(s):
    return re.sub(r"[*_`]", "", s).strip()


def parse_table(sec):
    lines = [l for l in sec.split("\n") if l.strip().startswith("|")]
    if len(lines) < 3:
        return None, []
    header = [plain(c) for c in split_row(lines[0])]
    rows = []
    for l in lines[2:]:
        cells = split_row(l)
        if all(re.fullmatch(r":?-{2,}:?", c.replace(" ", "")) for c in cells if c):
            continue
        rows.append(cells)
    return header, rows


def col(header, *names):
    for n in names:
        for i, h in enumerate(header):
            if h == n:
                return i
    for n in names:
        for i, h in enumerate(header):
            if n in h:
                return i
    return None


def hm(m):
    return m // 60 % 24, m % 60


def fmt(m):
    h, mi = hm(m)
    return f"{h:02d}:{mi:02d}"


def parse_total_text(s):
    s = plain(s)
    m = re.search(r"(\d+(?:\.\d+)?)\s*시간\s*(\d+)\s*분", s)
    if m:
        return round(float(m.group(1)) * 60) + int(m.group(2))
    m = re.search(r"(\d+(?:\.\d+)?)\s*시간", s)
    if m:
        return round(float(m.group(1)) * 60)
    m = re.search(r"(\d+)\s*분", s)
    if m:
        return int(m.group(1))
    return None


def find_total(text, path):
    ov = section(text, r"과정 개요")
    if ov:
        for line in ov.split("\n"):
            if re.search(r"총\s*(교육\s*)?시간", line):
                after = re.split(r"총\s*(?:교육\s*)?시간", line, maxsplit=1)[1]
                t = parse_total_text(after)
                if t:
                    return t, f'과정 개요 "{plain(line.strip(" -|"))[:60]}"'
        # 표 형식 과정 개요
        h, rows = parse_table(ov)
        if h:
            for r in rows:
                if r and re.search(r"총\s*(교육\s*)?시간", plain(r[0])) and len(r) > 1:
                    t = parse_total_text(r[1])
                    if t:
                        return t, f'과정 개요 표 "{plain(r[1])[:60]}"'
    req = os.path.join(os.path.dirname(path), "00_요청.md")
    if os.path.exists(req):
        rt = open(req, encoding="utf-8").read()
        sec = section(rt, r"교육 시간")
        if sec:
            body = "\n".join(l for l in sec.split("\n") if l.strip() and not l.strip().startswith("("))
            t = parse_total_text(body)
            if t:
                return t, f'00_요청.md "{body.strip()[:60]}"'
    return None, None


def classify(block, method):
    b, m = plain(block), plain(method)
    if any(k in b or k in m for k in ("휴식", "점심", "쉬는")):
        return "휴식"
    if any(k in m for k in ("실습", "개인", "짝", "조")):
        return "실습"
    if "전체" in m:
        return "강의"
    return "기타"


NUM_TOKEN = re.compile(r"(?<![\w.:])(\d+)(?:\s*분)?(?![\w.:])")


def breakdown_issue(text, minutes):
    """'30분 = 개인 판정 8 + 조별 합의 12 + AI 10' 형식 점검."""
    t = plain(text)
    m = re.match(r"\s*(\d+)\s*분\s*(?:=|:)\s*(.*)", t)
    if not m:
        return None
    stated = int(m.group(1))
    parts = [int(x) for x in NUM_TOKEN.findall(m.group(2))]
    msgs = []
    if stated != minutes:
        msgs.append(f"분해 시간 앞 숫자 {stated}분 ≠ 블록 {minutes}분")
    if parts and sum(parts) != stated:
        msgs.append(f"분해 숫자 합 {' + '.join(map(str, parts))} = {sum(parts)}분 ≠ {stated}분")
    return "; ".join(msgs) if msgs else None


def main():
    ap = argparse.ArgumentParser(description="커리큘럼표 시간 검산")
    ap.add_argument("file")
    ap.add_argument("--total", type=int, help="총 교육 시간(분)")
    a = ap.parse_args()

    if not os.path.exists(a.file):
        print(f"파일이 없습니다: {a.file}")
        sys.exit(2)
    text = open(a.file, encoding="utf-8").read()
    sec = section(text, r"커리큘럼표")
    if sec is None:
        print('"## 커리큘럼표" 제목을 찾지 못했습니다.')
        sys.exit(2)
    header, rows = parse_table(sec)
    if not header:
        print('"## 커리큘럼표" 아래에서 표를 찾지 못했습니다.')
        sys.exit(2)
    ci = col(header, "시간")
    cb = col(header, "블록")
    cm = col(header, "방식")
    cd = col(header, "분해 시간", "분해")
    if ci is None:
        print(f'표에 "시간" 열이 없습니다. 읽은 머리줄: {header}')
        sys.exit(2)

    def cell(r, i):
        return r[i] if i is not None and i < len(r) else ""

    blocks, unread = [], []
    day = 0
    for r in rows:
        tcell = cell(r, ci)
        dm = DAY_RE.search(plain(tcell)) or DAY_RE.search(plain(cell(r, cb)))
        if dm:
            day = int(dm.group(1) or dm.group(2)) - 1
        m = TIME_RE.search(plain(tcell))
        if not m:
            if any(plain(c) for c in r) and not dm:
                unread.append(" | ".join(plain(c) for c in r)[:60])
            continue
        s = day * 1440 + int(m.group(1)) * 60 + int(m.group(2))
        e = day * 1440 + int(m.group(3)) * 60 + int(m.group(4))
        if e <= s:
            e += 1440 if e < s else 0
        blocks.append({
            "time": f"{m.group(1).zfill(2)}:{m.group(2)}–{m.group(3).zfill(2)}:{m.group(4)}",
            "day": day, "s": s, "e": e, "min": e - s,
            "block": plain(cell(r, cb)), "method": plain(cell(r, cm)),
            "kind": classify(cell(r, cb), cell(r, cm)),
            "bd": breakdown_issue(cell(r, cd), e - s) if cd is not None else None,
        })

    if not blocks:
        print("시간(예: 09:00–09:24)을 읽은 행이 없습니다.")
        sys.exit(2)

    issues = 0
    multi = len({b["day"] for b in blocks}) > 1
    name = os.path.basename(a.file)
    out = [f"### check_time.py 결과 ({name})", ""]
    out.append("| # | 시간 | 블록 | 방식 | 분 | 구분 |")
    out.append("| --- | --- | --- | --- | --- | --- |")
    for i, b in enumerate(blocks, 1):
        t = (f"Day {b['day'] + 1} " if multi else "") + b["time"]
        out.append(f"| {i} | {t} | {b['block'][:30]} | {b['method']} | {b['min']} | {b['kind']} |")
    out.append("")

    total_blocks = sum(b["min"] for b in blocks)
    out.append(f"- 블록 분 합계: {' + '.join(str(b['min']) for b in blocks)} = **{total_blocks}분**")

    # 빈 시간·겹침 (시간 순)
    order = sorted(blocks, key=lambda b: (b["s"], b["e"]))
    if order != blocks:
        out.append("- 표의 행 순서가 시간 순서와 다릅니다. 시간 순으로 보고 점검했습니다.")
        issues += 1
    gaps, overlaps = [], []
    for p, q in zip(order, order[1:]):
        if q["day"] != p["day"]:
            continue
        if q["s"] > p["e"]:
            gaps.append(f"{fmt(p['e'])}–{fmt(q['s'])} ({q['s'] - p['e']}분, '{p['block'][:15]}' 뒤)")
        elif q["s"] < p["e"]:
            overlaps.append(f"{fmt(q['s'])}–{fmt(min(p['e'], q['e']))} ({min(p['e'], q['e']) - q['s']}분, '{p['block'][:15]}'와 '{q['block'][:15]}')")
    days = sorted({b["day"] for b in blocks})
    spans = []
    span_total = 0
    for dday in days:
        ds = [b for b in blocks if b["day"] == dday]
        st, en = min(b["s"] for b in ds), max(b["e"] for b in ds)
        span_total += en - st
        spans.append((f"Day {dday + 1} " if multi else "") + f"{fmt(st)}–{fmt(en)} ({en - st}분)")
    out.append(f"- 처음–끝: {', '.join(spans)}")
    out.append(f"- 빈 시간: {'; '.join(gaps) if gaps else '없음'}")
    out.append(f"- 겹치는 시간: {'; '.join(overlaps) if overlaps else '없음'}")
    issues += len(gaps) + len(overlaps)

    total, src = (a.total, "--total 인자") if a.total else find_total(text, a.file)
    if total:
        diff = total_blocks - total
        verdict = "일치" if diff == 0 else ("블록 합계가 " + (f"{diff}분 많음" if diff > 0 else f"{-diff}분 모자람"))
        out.append(f"- 총 교육 시간: {total}분 ({src}) → 블록 합계 {total_blocks}분과 차이 {diff:+d}분, **{verdict}**")
        if diff != 0:
            issues += 1
    else:
        out.append("- 총 교육 시간: 읽지 못함. --total <분>으로 다시 실행하세요.")
        issues += 1

    sums = {k: sum(b["min"] for b in blocks if b["kind"] == k) for k in ("강의", "실습", "휴식", "기타")}
    out.append(f"- 강의 {sums['강의']}분 · 실습 {sums['실습']}분 · 휴식 {sums['휴식']}분" + (f" · 기타 {sums['기타']}분" if sums["기타"] else ""))
    lp = sums["강의"] + sums["실습"]
    if lp:
        lr = sums["강의"] / lp * 100
        out.append(f"- 강의:실습 = {sums['강의']}:{sums['실습']} = {lr:.0f}:{100 - lr:.0f} (휴식·기타 빼고, 10 기준 {lr / 10:.1f}:{(100 - lr) / 10:.1f})")
    if sums["기타"]:
        others = [b["block"][:15] for b in blocks if b["kind"] == "기타"]
        out.append(f"- 구분 못 한 블록(방식 칸 확인): {', '.join(others)}")

    bds = [f"{i}번 '{b['block'][:15]}': {b['bd']}" for i, b in enumerate(blocks, 1) if b["bd"]]
    if cd is None:
        out.append('- 분해 시간: "분해 시간" 열이 없어 점검하지 않음')
    else:
        out.append(f"- 분해 시간 점검: {'; '.join(bds) if bds else '모두 맞음'}")
        issues += len(bds)
    if unread:
        out.append(f"- 시간을 읽지 못한 행 {len(unread)}개(합계에서 빠짐): " + "; ".join(unread))
        issues += len(unread)

    out.append("")
    out.append("결과: " + ("문제 없음" if issues == 0 else f"고칠 곳 {issues}개"))
    print("\n".join(out))
    sys.exit(0 if issues == 0 else 1)


if __name__ == "__main__":
    main()
