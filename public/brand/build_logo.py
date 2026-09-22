#!/usr/bin/env python3
"""DRC identity — Test the rider. Test the motorcycle."""

from pathlib import Path

OUT = Path(__file__).resolve().parent
BONE = "#F3EEE4"
VIOLET = "#7A3CFF"
TAR = "#0B0B0B"
FONT = "../magazine/ultimate-rider/fonts/Oswald.ttf"
GAP = 28


def path_d(*polys):
    chunks = []
    for pts in polys:
        cmds = [f"M{pts[0][0]:.2f},{pts[0][1]:.2f}"]
        cmds.extend(f"L{x:.2f},{y:.2f}" for x, y in pts[1:])
        cmds.append("Z")
        chunks.append(" ".join(cmds))
    return " ".join(chunks)


def letter_d(x, y, h=200, fill=BONE):
    s = h / 200.0

    def t(px, py):
        return (x + px * s, y + py * s)

    outer = [t(0, 0), t(128, 0), t(176, 48), t(176, 152), t(128, 200), t(0, 200)]
    inner = [t(56, 52), t(108, 52), t(122, 66), t(122, 134), t(108, 148), t(56, 148)]
    return f'<path fill="{fill}" fill-rule="evenodd" d="{path_d(outer, inner)}"/>', 176 * s


def letter_r(x, y, h=200, fill=BONE):
    s = h / 200.0

    def t(px, py):
        return (x + px * s, y + py * s)

    outer = [
        t(0, 0),
        t(118, 0),
        t(162, 44),
        t(162, 100),
        t(118, 100),
        t(176, 172),
        t(176, 200),
        t(108, 200),
        t(56, 136),
        t(56, 200),
        t(0, 200),
    ]
    counter = [t(56, 46), t(110, 46), t(122, 58), t(122, 88), t(56, 88)]
    return f'<path fill="{fill}" fill-rule="evenodd" d="{path_d(outer, counter)}"/>', 176 * s


def letter_c(x, y, h=200, fill=BONE):
    s = h / 200.0

    def t(px, py):
        return (x + px * s, y + py * s)

    # One path so the mouth is a real opening, not an even-odd bite.
    pts = [
        t(0, 0),
        t(128, 0),
        t(176, 48),
        t(176, 70),
        t(122, 70),
        t(122, 66),
        t(108, 52),
        t(56, 52),
        t(56, 148),
        t(108, 148),
        t(122, 134),
        t(122, 130),
        t(176, 130),
        t(176, 152),
        t(128, 200),
        t(0, 200),
    ]
    return f'<path fill="{fill}" d="{path_d(pts)}"/>', 176 * s


def wordmark(x, y, h=200, fill=BONE):
    parts = []
    cursor = x
    d, w = letter_d(cursor, y, h, fill)
    parts.append(d)
    cursor += w + GAP * (h / 200)
    r, w = letter_r(cursor, y, h, fill)
    parts.append(r)
    cursor += w + GAP * (h / 200)
    c, w = letter_c(cursor, y, h, fill)
    parts.append(c)
    cursor += w
    return "\n    ".join(parts), cursor - x


def svg_wrap(body, vb, bg=None):
    bg_rect = f'<rect width="100%" height="100%" fill="{bg}"/>\n  ' if bg else ""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="none">
  <defs>
    <style type="text/css">
      @font-face {{
        font-family: "Oswald";
        src: url("{FONT}") format("truetype");
        font-weight: 200 700;
      }}
    </style>
  </defs>
  {bg_rect}{body}
</svg>
'''


def lockup_svg(bg=TAR):
    pad = 100
    h = 200
    fill = BONE if bg == TAR else TAR
    marks, wm_w = wordmark(pad, pad, h, fill)
    sq = 18
    tests_y = pad + h + 48
    line_h = 40
    tx = pad + sq + 18
    ink = fill
    tests = f'''
    <rect x="{pad}" y="{tests_y}" width="{sq}" height="{sq}" fill="{VIOLET}"/>
    <rect x="{pad}" y="{tests_y + line_h}" width="{sq}" height="{sq}" fill="{VIOLET}"/>
    <text x="{tx}" y="{tests_y + 16}" fill="{ink}" font-family="Oswald, sans-serif" font-size="22" font-weight="500" letter-spacing="4.4">TEST THE RIDER</text>
    <text x="{tx}" y="{tests_y + line_h + 16}" fill="{ink}" font-family="Oswald, sans-serif" font-size="22" font-weight="500" letter-spacing="4.4">TEST THE MOTORCYCLE</text>
    '''
    width = pad * 2 + wm_w
    height = tests_y + line_h + sq + pad
    body = f"<g>\n    {marks}\n    {tests}\n  </g>"
    return svg_wrap(body, f"0 0 {width:.0f} {height:.0f}", bg), width, height


def wordmark_svg(bg=None):
    pad = 40
    fill = BONE if bg == TAR else TAR
    marks, wm_w = wordmark(pad, pad, 200, fill)
    return svg_wrap(f"<g>\n    {marks}\n  </g>", f"0 0 {wm_w + pad * 2:.0f} {200 + pad * 2}", bg)


def symbol_svg(bg=TAR, labels=True):
    fill = BONE if bg == TAR else TAR
    pad_x, pad_y = 200, 100
    h = 220
    marks, wm_w = wordmark(pad_x + 40, pad_y, h, fill)
    line_w = wm_w + 160
    x0 = pad_x - 80
    y1 = pad_y + h * 0.28
    y2 = pad_y + h * 0.78
    thick = 5
    v_h = 9
    s = h / 200
    d_x = pad_x + 40
    r_x = d_x + 176 * s + GAP * s
    c_x = r_x + 176 * s + GAP * s

    def violets(y):
        out = []
        for hx, hw in [(d_x, 56 * s), (r_x, 56 * s), (c_x, 56 * s)]:
            out.append(
                f'<rect x="{hx:.2f}" y="{y - 2:.2f}" width="{hw:.2f}" height="{v_h}" fill="{VIOLET}"/>'
            )
        return "\n    ".join(out)

    labels_svg = ""
    if labels:
        labels_svg = f'''
    <text x="{x0}" y="{y1 - 16}" fill="{fill}" font-family="Oswald, sans-serif" font-size="13" font-weight="500" letter-spacing="3.2">RIDER</text>
    <text x="{x0}" y="{y2 - 16}" fill="{fill}" font-family="Oswald, sans-serif" font-size="13" font-weight="500" letter-spacing="3.2">MOTORCYCLE</text>
    '''
    lines = f'''
    <rect x="{x0}" y="{y1}" width="{line_w}" height="{thick}" fill="{fill}"/>
    <rect x="{x0}" y="{y2}" width="{line_w}" height="{thick}" fill="{fill}"/>
    {labels_svg}
    {marks}
    {violets(y1)}
    {violets(y2)}
    '''
    width = x0 + line_w + pad_x
    height = pad_y + h + pad_y
    return svg_wrap(f"<g>{lines}\n  </g>", f"0 0 {width:.0f} {height:.0f}", bg)


def compact_svg(bg=TAR):
    fill = BONE if bg == TAR else TAR
    pad = 48
    h = 160
    marks, wm_w = wordmark(pad, pad, h, fill)
    sq = 16
    gap = 10
    sx = pad + wm_w + 26
    sy = pad + (h - (sq * 2 + gap)) / 2
    squares = f'''
    <rect x="{sx}" y="{sy}" width="{sq}" height="{sq}" fill="{VIOLET}"/>
    <rect x="{sx}" y="{sy + sq + gap}" width="{sq}" height="{sq}" fill="{VIOLET}"/>
    '''
    width = sx + sq + pad
    height = h + pad * 2
    return svg_wrap(f"<g>\n    {marks}\n    {squares}\n  </g>", f"0 0 {width:.0f} {height:.0f}", bg)


def main():
    (OUT / "drc-lockup.svg").write_text(lockup_svg(TAR)[0])
    (OUT / "drc-lockup-clear.svg").write_text(lockup_svg(None)[0])
    (OUT / "drc-wordmark.svg").write_text(wordmark_svg(None))
    (OUT / "drc-wordmark-on-tar.svg").write_text(wordmark_svg(TAR))
    (OUT / "drc-symbol.svg").write_text(symbol_svg(TAR, True))
    (OUT / "drc-symbol-clear.svg").write_text(symbol_svg(None, True))
    (OUT / "drc-compact.svg").write_text(compact_svg(TAR))
    (OUT / "drc-compact-clear.svg").write_text(compact_svg(None))
    print("wrote SVGs to", OUT)


if __name__ == "__main__":
    main()
