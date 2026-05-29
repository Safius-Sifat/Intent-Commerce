#!/usr/bin/env python3
"""Generate IntentCommerce /browse catalog designs in pencil-new.pen."""

from __future__ import annotations

import json
import random
import string
from copy import deepcopy
from pathlib import Path

PEN_PATH = Path(__file__).resolve().parents[1] / "pencil-new.pen"

# Design tokens (match .pen variables)
BG = "$page-bg"
CARD = "$surface-card"
TEXT = "$text-primary"
TEXT_SEC = "$text-secondary"
TEXT_MUTED = "$text-muted"
GREEN = "$brand-green"
GREEN_HOVER = "$brand-green-hover"
SOFT_GREEN = "$soft-green"
BORDER = "$border-default"
AMBER = "$accent-amber"
SUCCESS = "$success"
ERROR = "$error"
WARNING = "$warning"
FONT = "$font-primary"
FONT_MONO = "Geist Mono"

_counter = 0


def uid(prefix: str = "") -> str:
    global _counter
    _counter += 1
    base = "".join(random.choices(string.ascii_letters + string.digits, k=5))
    return f"{prefix}{base}"[:12]


def txt(
    content: str,
    *,
    name: str = "Text",
    size: int = 14,
    weight: str = "normal",
    fill: str = TEXT,
    width: str | None = None,
    node_id: str | None = None,
) -> dict:
    node: dict = {
        "type": "text",
        "id": node_id or uid("t"),
        "name": name,
        "fill": fill,
        "content": content,
        "fontFamily": FONT,
        "fontSize": size,
        "fontWeight": weight,
    }
    if width:
        node["textGrowth"] = "fixed-width"
        node["width"] = width
    return node


def icon(
    icon_name: str,
    *,
    name: str = "Icon",
    size: int = 20,
    fill: str = TEXT_SEC,
    node_id: str | None = None,
) -> dict:
    return {
        "type": "icon_font",
        "id": node_id or uid("i"),
        "name": name,
        "width": size,
        "height": size,
        "iconFontName": icon_name,
        "iconFontFamily": "lucide",
        "fill": fill,
    }


def frame(
    name: str,
    children: list | None = None,
    *,
    node_id: str | None = None,
    layout: str | None = None,
    width: str | int | None = None,
    height: str | int | None = None,
    fill: str | None = None,
    gap: int | None = None,
    padding: list | None = None,
    corner_radius: int | None = None,
    stroke: dict | None = None,
    align_items: str | None = None,
    justify: str | None = None,
    reusable: bool = False,
    clip: bool = False,
    effect: dict | None = None,
) -> dict:
    node: dict = {"type": "frame", "id": node_id or uid("f"), "name": name}
    if layout:
        node["layout"] = layout
    if width is not None:
        node["width"] = width
    if height is not None:
        node["height"] = height
    if fill:
        node["fill"] = fill
    if gap is not None:
        node["gap"] = gap
    if padding:
        node["padding"] = padding
    if corner_radius is not None:
        node["cornerRadius"] = corner_radius
    if stroke:
        node["stroke"] = stroke
    if align_items:
        node["alignItems"] = align_items
    if justify:
        node["justifyContent"] = justify
    if reusable:
        node["reusable"] = True
    if clip:
        node["clip"] = True
    if effect:
        node["effect"] = effect
    if children is not None:
        node["children"] = children
    return node


def btn_primary(label: str, *, small: bool = False) -> dict:
    return frame(
        label,
        [
            txt(
                label,
                name="Label",
                size=13 if small else 14,
                weight="600",
                fill="$text-inverse",
            )
        ],
        fill=GREEN,
        corner_radius=10,
        padding=[10, 16] if small else [12, 20],
        align_items="center",
    )


def btn_ghost(label: str) -> dict:
    return frame(
        label,
        [txt(label, name="Label", size=13, weight="500", fill=TEXT)],
        fill="#00000000",
        corner_radius=10,
        stroke={"thickness": 1, "fill": BORDER},
        padding=[10, 16],
        align_items="center",
    )


def chip(label: str, *, active: bool = False, amber: bool = False) -> dict:
    if active:
        return frame(
            label,
            [txt(label, name="Label", size=12, weight="500", fill="$text-inverse")],
            fill=GREEN,
            corner_radius=999,
            padding=[8, 14],
            align_items="center",
        )
    fill = "#FFF8EB" if amber else CARD
    stroke = {"thickness": 1, "fill": AMBER if amber else BORDER}
    return frame(
        label,
        [
            txt(
                label,
                name="Label",
                size=12,
                fill=WARNING if amber else TEXT_SEC,
            )
        ],
        fill=fill,
        corner_radius=999,
        stroke=stroke,
        padding=[8, 14],
        align_items="center",
    )


def badge(label: str, *, variant: str = "green") -> dict:
    styles = {
        "green": (SOFT_GREEN, GREEN),
        "amber": ("#FFF8EB", WARNING),
        "neutral": ("#F3F4F6", TEXT_SEC),
    }
    bg, fg = styles.get(variant, styles["green"])
    return frame(
        label,
        [txt(label, name="Label", size=10, weight="600", fill=fg)],
        fill=bg,
        corner_radius=999,
        padding=[4, 8],
        align_items="center",
    )


# --- Reusable catalog product card ---
CATALOG_CARD_ID = "CatPrd"


def catalog_product_card() -> dict:
    """Reusable premium product card for browse grid."""
    return frame(
        "CatalogProductCard",
        [
            frame(
                "ImageWrap",
                [
                    frame(
                        "Image",
                        [],
                        width="fill_container",
                        height=160,
                        fill=SOFT_GREEN,
                        corner_radius=14,
                    ),
                    frame(
                        "BadgePos",
                        [badge("In stock", variant="green")],
                        padding=[10, 10],
                    ),
                ],
                width="fill_container",
                layout="vertical",
            ),
            txt("Everyday Campus Backpack", name="Title", size=14, weight="600", width="fill_container"),
            txt("by UrbanCart", name="Vendor", size=12, fill=TEXT_SEC),
            frame(
                "Rating",
                [
                    icon("star", name="Star", size=14, fill=AMBER),
                    txt("4.7 · 128 reviews", name="Reviews", size=12, fill=TEXT_SEC),
                ],
                gap=4,
                align_items="center",
            ),
            txt(
                "Matches your budget and daily-use need.",
                name="Match",
                size=11,
                fill=GREEN,
                width="fill_container",
            ),
            frame(
                "PriceRow",
                [
                    txt("$49.00", name="Price", size=18, weight="700", fill=TEXT),
                ],
                width="fill_container",
                align_items="center",
            ),
            frame(
                "Actions",
                [
                    btn_primary("Add to cart", small=True),
                    frame(
                        "Save",
                        [icon("heart", name="Heart", size=18, fill=TEXT_SEC)],
                        corner_radius=10,
                        stroke={"thickness": 1, "fill": BORDER},
                        padding=[10, 10],
                        align_items="center",
                    ),
                    frame(
                        "QuickView",
                        [icon("eye", name="Eye", size=18, fill=TEXT_SEC)],
                        corner_radius=10,
                        stroke={"thickness": 1, "fill": BORDER},
                        padding=[10, 10],
                        align_items="center",
                    ),
                ],
                width="fill_container",
                gap=8,
                align_items="center",
            ),
        ],
        node_id=CATALOG_CARD_ID,
        reusable=True,
        width=280,
        fill=CARD,
        corner_radius=20,
        stroke={"thickness": 1, "fill": BORDER},
        layout="vertical",
        gap=10,
        padding=14,
    )


def product_ref(
    name: str,
    vendor: str,
    price: str,
    rating: str,
    badge_label: str,
    badge_variant: str = "green",
    match_line: str | None = None,
    btn_label: str = "Add to cart",
) -> dict:
    descendants: dict = {}
    # We'll use a simplified inline card since refs need stable descendant ids
    children = [
        frame(
            "ImageWrap",
            [
                frame("Image", [], width="fill_container", height=160, fill=SOFT_GREEN, corner_radius=14),
                frame("BadgePos", [badge(badge_label, variant=badge_variant)], padding=[10, 10]),
            ],
            width="fill_container",
        ),
        txt(name, name="Title", size=14, weight="600", width="fill_container"),
        txt(f"by {vendor}", name="Vendor", size=12, fill=TEXT_SEC),
        frame(
            "Rating",
            [
                icon("star", size=14, fill=AMBER),
                txt(rating, size=12, fill=TEXT_SEC),
            ],
            gap=4,
            align_items="center",
        ),
    ]
    if match_line:
        children.append(txt(match_line, name="Match", size=11, fill=GREEN, width="fill_container"))
    children.extend(
        [
            txt(price, name="Price", size=18, weight="700"),
            frame(
                "Actions",
                [
                    frame(
                        "AddBtn",
                        [txt(btn_label, size=13, weight="600", fill="$text-inverse")],
                        fill=GREEN if btn_label == "Add to cart" else SUCCESS,
                        corner_radius=10,
                        padding=[10, 14],
                        align_items="center",
                    ),
                    frame(
                        "Save",
                        [icon("heart", size=18, fill=TEXT_SEC)],
                        corner_radius=10,
                        stroke={"thickness": 1, "fill": BORDER},
                        padding=[10, 10],
                        align_items="center",
                    ),
                    frame(
                        "QV",
                        [icon("eye", size=18, fill=TEXT_SEC)],
                        corner_radius=10,
                        stroke={"thickness": 1, "fill": BORDER},
                        padding=[10, 10],
                        align_items="center",
                    ),
                ],
                gap=8,
                align_items="center",
            ),
        ]
    )
    return frame(name, children, width="fill_container", fill=CARD, corner_radius=20, stroke={"thickness": 1, "fill": BORDER}, layout="vertical", gap=10, padding=14)


PRODUCTS = [
    ("Everyday Campus Backpack", "UrbanCart", "$49.00", "4.7 · 128 reviews", "Best match", "green", "Matches your budget and daily-use need."),
    ("Wireless Comfort Earbuds", "TechNest", "$79.00", "4.6 · 89 reviews", "Trending", "amber", None),
    ("Minimal Study Desk Lamp", "HomeEase", "$34.00", "4.5 · 56 reviews", "Low stock", "amber", None),
    ("Cotton Everyday Tote", "StyleHub", "$22.00", "4.8 · 201 reviews", "Budget friendly", "green", None),
    ("Stainless Water Bottle", "GreenMart", "$18.00", "4.4 · 74 reviews", "New", "green", None),
    ("Noise Reducing Headphones", "TechNest", "$119.00", "4.7 · 312 reviews", "Best seller", "green", None),
]


def browse_navbar(*, cart_count: str = "3", browse_active: bool = True) -> dict:
    def nav_link(label: str, active: bool) -> dict:
        return txt(
            label,
            name=label,
            size=14,
            weight="600" if active else "normal",
            fill=GREEN if active else TEXT_SEC,
        )

    return frame(
        "Navbar",
        [
            frame(
                "Logo",
                [
                    frame(
                        "Mark",
                        [icon("shopping-bag", fill=GREEN, size=18)],
                        width=32,
                        height=32,
                        fill=SOFT_GREEN,
                        corner_radius=8,
                        justify="center",
                        align_items="center",
                    ),
                    txt("IntentCommerce", size=18, weight="700"),
                ],
                gap=10,
                align_items="center",
            ),
            frame(
                "Nav Links",
                [
                    nav_link("Browse", browse_active),
                    nav_link("Chat", False),
                    nav_link("Orders", False),
                ],
                gap=28,
                align_items="center",
            ),
            frame(
                "Actions",
                [
                    cart_preview(),
                    frame(
                        "Cart",
                        [
                            icon("shopping-cart", fill=TEXT, size=20),
                            frame(
                                "Badge",
                                [txt(cart_count, size=10, weight="700", fill="$text-inverse")],
                                fill=GREEN,
                                corner_radius=999,
                                padding=[2, 6],
                                align_items="center",
                            ),
                        ],
                        gap=6,
                        align_items="center",
                    ),
                    txt("Login", size=14, weight="500"),
                    frame(
                        "Create",
                        [txt("Create account", size=14, weight="600", fill="$text-inverse")],
                        fill=GREEN,
                        corner_radius=10,
                        padding=[11, 18],
                        align_items="center",
                    ),
                ],
                gap=16,
                align_items="center",
            ),
        ],
        width="fill_container",
        height=72,
        fill=CARD,
        stroke={"thickness": {"bottom": 1}, "fill": BORDER},
        padding=[0, 48],
        justify="space_between",
        align_items="center",
    )


def search_bar(*, query: str | None = None, compact: bool = False) -> dict:
    placeholder = "Search products, brands, categories, or describe what you need…"
    field_content = query if query else placeholder
    field_fill = TEXT if query else TEXT_MUTED
    return frame(
        "SearchBar",
        [
            frame(
                "Input",
                [
                    icon("search", size=20, fill=TEXT_SEC),
                    txt(
                        field_content,
                        name="Query",
                        size=14 if compact else 15,
                        fill=field_fill,
                        width="fill_container",
                    ),
                ],
                width="fill_container",
                fill=CARD,
                corner_radius=14,
                stroke={"thickness": 1, "fill": GREEN if query else BORDER},
                padding=[14, 18] if not compact else [12, 14],
                gap=12,
                align_items="center",
            ),
            btn_primary("Search", small=compact),
            btn_ghost("Ask for help"),
        ],
        width="fill_container",
        gap=12,
        align_items="center",
    )


def category_chips_row() -> dict:
    cats = [
        ("All", True, False),
        ("Fashion", False, False),
        ("Electronics", False, False),
        ("Home & Living", False, False),
        ("Beauty", False, False),
        ("Grocery", False, False),
        ("Books", False, False),
        ("Stationery", False, False),
        ("Sports", False, False),
        ("Trending now", False, True),
    ]
    return frame(
        "CategoryChips",
        [chip(c[0], active=c[1], amber=c[2]) for c in cats],
        width="fill_container",
        gap=8,
    )


def filter_sidebar() -> dict:
    def section(title: str, body_children: list) -> dict:
        return frame(
            title,
            [
                txt(title, size=13, weight="600"),
                frame("Body", body_children, layout="vertical", gap=8, width="fill_container"),
            ],
            layout="vertical",
            gap=10,
            width="fill_container",
        )

    def checkbox(label: str, checked: bool = False) -> dict:
        return frame(
            label,
            [
                frame(
                    "Box",
                    [icon("check", size=12, fill="$text-inverse")] if checked else [],
                    width=18,
                    height=18,
                    fill=GREEN if checked else CARD,
                    corner_radius=4,
                    stroke={"thickness": 1, "fill": GREEN if checked else BORDER},
                    align_items="center",
                    justify="center",
                ),
                txt(label, size=13, fill=TEXT),
            ],
            gap=10,
            align_items="center",
        )

    categories = [
        "Fashion",
        "Electronics",
        "Home & Living",
        "Beauty",
        "Grocery",
        "Books",
        "Stationery",
        "Sports",
    ]
    vendors = ["UrbanCart", "GreenMart", "TechNest", "HomeEase", "StyleHub"]

    return frame(
        "FilterSidebar",
        [
            txt("Filters", size=16, weight="600"),
            section("Category", [checkbox(c, checked=(c == "Fashion")) for c in categories[:4]] + [checkbox("…", checked=False)]),
            section(
                "Price range",
                [
                    frame(
                        "Range",
                        [
                            frame("Min", [txt("$0", size=13, fill=TEXT_SEC)], fill=BG, corner_radius=8, stroke={"thickness": 1, "fill": BORDER}, padding=[8, 12], width="fill_container"),
                            txt("—", fill=TEXT_SEC),
                            frame("Max", [txt("$200", size=13, fill=TEXT_SEC)], fill=BG, corner_radius=8, stroke={"thickness": 1, "fill": BORDER}, padding=[8, 12], width="fill_container"),
                        ],
                        gap=8,
                        align_items="center",
                        width="fill_container",
                    ),
                ],
            ),
            section(
                "Availability",
                [checkbox("In stock", True), checkbox("Low stock"), checkbox("New arrivals")],
            ),
            section("Vendor", [checkbox(v) for v in vendors]),
            section(
                "Rating",
                [checkbox("4 stars & above"), checkbox("3 stars & above")],
            ),
            section(
                "Recommendation fit",
                [
                    checkbox("Best match", True),
                    checkbox("Budget friendly"),
                    checkbox("Popular choice"),
                    checkbox("Fast moving"),
                ],
            ),
            frame(
                "Actions",
                [
                    btn_primary("Apply filters"),
                    btn_ghost("Clear all"),
                ],
                layout="vertical",
                gap=10,
                width="fill_container",
            ),
        ],
        width=280,
        fill=CARD,
        corner_radius=16,
        stroke={"thickness": 1, "fill": BORDER},
        layout="vertical",
        gap=20,
        padding=20,
    )


def smart_discovery_card() -> dict:
    return frame(
        "SmartDiscovery",
        [
            txt("Not sure what to search?", size=15, weight="600"),
            txt(
                "Describe your need, budget, or occasion and we'll show relevant products.",
                size=13,
                fill=TEXT_SEC,
                width="fill_container",
            ),
            frame(
                "InputRow",
                [
                    frame(
                        "Field",
                        [
                            txt(
                                "Example: I need a gift for a student under $50",
                                size=13,
                                fill=TEXT_MUTED,
                                width="fill_container",
                            ),
                            icon("arrow-right", size=18, fill=GREEN),
                        ],
                        width="fill_container",
                        fill=CARD,
                        corner_radius=10,
                        padding=[12, 14],
                        gap=8,
                        align_items="center",
                    ),
                    btn_primary("Find matches", small=True),
                ],
                gap=10,
                align_items="center",
                width="fill_container",
            ),
        ],
        width=320,
        fill=SOFT_GREEN,
        corner_radius=16,
        stroke={"thickness": 1, "fill": BORDER},
        layout="vertical",
        gap=12,
        padding=20,
    )


def catalog_controls(*, result_text: str, sort_label: str = "Recommended", show_filter_btn: bool = False) -> dict:
    right = [
        frame(
            "Sort",
            [
                txt("Sort:", size=13, fill=TEXT_SEC),
                frame(
                    "Select",
                    [
                        txt(sort_label, size=13, weight="500"),
                        icon("chevron-down", size=16),
                    ],
                    fill=CARD,
                    corner_radius=8,
                    stroke={"thickness": 1, "fill": BORDER},
                    padding=[8, 12],
                    gap=8,
                    align_items="center",
                ),
            ],
            gap=8,
            align_items="center",
        ),
    ]
    if show_filter_btn:
        right.insert(
            0,
            frame(
                "FilterBtn",
                [icon("sliders-horizontal", size=16), txt("Filters", size=13, weight="500")],
                fill=CARD,
                corner_radius=8,
                stroke={"thickness": 1, "fill": BORDER},
                padding=[8, 12],
                gap=6,
                align_items="center",
            ),
        )
    return frame(
        "CatalogControls",
        [
            txt(result_text, size=13, fill=TEXT_SEC, width="fill_container"),
            frame("Right", right, gap=12, align_items="center"),
        ],
        width="fill_container",
        justify="space_between",
        align_items="center",
    )


def product_grid(rows: int = 2, cols: int = 3, product_slice: slice | None = None) -> dict:
    items = PRODUCTS[product_slice] if product_slice else PRODUCTS
    row_frames = []
    idx = 0
    while idx < len(items):
        row_items = []
        for _ in range(cols):
            if idx >= len(items):
                break
            p = items[idx]
            row_items.append(
                product_ref(p[0], p[1], p[2], p[3], p[4], p[5], p[6] if len(p) > 6 else None)
            )
            idx += 1
        if row_items:
            row_frames.append(frame(f"Row", row_items, width="fill_container", gap=16))
    return frame("ProductGrid", row_frames, width="fill_container", layout="vertical", gap=16)


def catalog_header(*, show_discovery: bool = True) -> dict:
    header_children = [
        frame(
            "Titles",
            [
                txt("Browse products", size=28, weight="700"),
                txt(
                    "Search, filter, or describe what you need to find better matches faster.",
                    size=15,
                    fill=TEXT_SEC,
                    width=600,
                ),
            ],
            layout="vertical",
            gap=8,
            width="fill_container",
        ),
        search_bar(),
        category_chips_row(),
        floating_help(),
    ]
    if show_discovery:
        return frame(
            "PageHeader",
            [
                frame("HeaderTop", header_children, layout="vertical", gap=20, width="fill_container"),
            ],
            width="fill_container",
            layout="vertical",
            gap=20,
        )
    return frame("PageHeader", header_children, layout="vertical", gap=20, width="fill_container")


def floating_help() -> dict:
    return frame(
        "HelpPrompt",
        [
            icon("message-circle", size=18, fill=GREEN),
            txt("Need help finding something?", size=13, weight="500", fill=GREEN),
        ],
        fill=CARD,
        corner_radius=999,
        stroke={"thickness": 1, "fill": BORDER},
        padding=[12, 20],
        gap=8,
        align_items="center",
        effect={
            "type": "shadow",
            "shadowType": "outer",
            "color": "#245B4F18",
            "offset": {"x": 0, "y": 4},
            "blur": 16,
        },
    )


def cart_preview() -> dict:
    return frame(
        "CartPreview",
        [
            icon("shopping-cart", size=18, fill=GREEN),
            frame(
                "Info",
                [
                    txt("3 items", size=13, weight="600"),
                    txt("Est. $148.00", size=12, fill=TEXT_SEC),
                ],
                layout="vertical",
                gap=2,
            ),
            frame(
                "View",
                [txt("View cart", size=12, weight="600", fill=GREEN)],
                corner_radius=8,
                padding=[6, 10],
                align_items="center",
            ),
        ],
        fill=CARD,
        corner_radius=12,
        stroke={"thickness": 1, "fill": BORDER},
        padding=[12, 16],
        gap=12,
        align_items="center",
        effect={
            "type": "shadow",
            "shadowType": "outer",
            "color": "#00000012",
            "offset": {"x": 0, "y": 2},
            "blur": 12,
        },
    )


def screen_frame(
    name: str,
    body_children: list,
    *,
    x: int,
    y: int,
    width: int = 1440,
    height: int = 1200,
    extras: list | None = None,
) -> dict:
    children = [browse_navbar(), *body_children]
    if extras:
        children.extend(extras)
    node = frame(
        name,
        children,
        width=width,
        height=height,
        fill=BG,
        layout="vertical",
        clip=True,
        node_id=uid("scr"),
    )
    node["x"] = x
    node["y"] = y
    return node


def desktop_catalog_body(*, search_query: str | None = None, filtered: bool = False) -> list:
    result = (
        "Showing results for 'university backpack' · 18 products"
        if search_query
        else ("42 products found" if filtered else "124 products found")
    )
    main = frame(
        "Main",
        [
            filter_sidebar(),
            frame(
                "Content",
                [
                    catalog_controls(result_text=result),
                    product_grid(),
                ],
                width="fill_container",
                layout="vertical",
                gap=20,
            ),
        ],
        width="fill_container",
        height="fill_container",
        gap=24,
        padding=[0, 48, 32, 48],
    )
    header_section = frame(
        "HeaderSection",
        [
            frame(
                "HeaderRow",
                [
                    catalog_header(),
                    smart_discovery_card(),
                ],
                width="fill_container",
                gap=24,
                padding=[24, 48, 0, 48],
            ),
            main,
        ],
        width="fill_container",
        height="fill_container",
        layout="vertical",
        gap=8,
    )
    if search_query:
        # replace search in header
        header_section["children"][0]["children"][0] = frame(
            "PageHeader",
            [
                frame(
                    "Titles",
                    [
                        txt("Browse products", size=28, weight="700"),
                        txt(
                            "Search, filter, or describe what you need to find better matches faster.",
                            size=15,
                            fill=TEXT_SEC,
                            width=600,
                        ),
                    ],
                    layout="vertical",
                    gap=8,
                ),
                search_bar(query=search_query),
                category_chips_row(),
            ],
            layout="vertical",
            gap=20,
            width="fill_container",
        )
    return [header_section]


def build_screens() -> list[dict]:
    base_x, base_y = 28800, 0
    gap_x, gap_y = 1520, 1280
    screens = []

    # 1 Desktop default
    screens.append(
        screen_frame(
            "Browse — Desktop /browse",
            desktop_catalog_body(),
            x=base_x,
            y=base_y,
            height=1400,
        )
    )

    # 2 Mobile
    mobile_body = frame(
        "Body",
        [
            frame(
                "MobileHeader",
                [
                    txt("Browse products", size=22, weight="700"),
                    txt(
                        "Search, filter, or describe what you need.",
                        size=13,
                        fill=TEXT_SEC,
                        width="fill_container",
                    ),
                    search_bar(compact=True),
                    category_chips_row(),
                ],
                layout="vertical",
                gap=14,
                padding=[16, 16, 0, 16],
                width="fill_container",
            ),
            catalog_controls(
                result_text="124 products found",
                show_filter_btn=True,
            ),
            frame(
                "Grid",
                [
                    product_ref(PRODUCTS[0][0], PRODUCTS[0][1], PRODUCTS[0][2], PRODUCTS[0][3], PRODUCTS[0][4], PRODUCTS[0][5], PRODUCTS[0][6]),
                    product_ref(PRODUCTS[1][0], PRODUCTS[1][1], PRODUCTS[1][2], PRODUCTS[1][3], PRODUCTS[1][4], PRODUCTS[1][5]),
                    product_ref(PRODUCTS[2][0], PRODUCTS[2][1], PRODUCTS[2][2], PRODUCTS[2][3], PRODUCTS[2][4], PRODUCTS[2][5]),
                    product_ref(PRODUCTS[3][0], PRODUCTS[3][1], PRODUCTS[3][2], PRODUCTS[3][3], PRODUCTS[3][4], PRODUCTS[3][5]),
                ],
                width="fill_container",
                gap=12,
                padding=[0, 16, 16, 16],
            ),
        ],
        width="fill_container",
        height="fill_container",
        layout="vertical",
        gap=12,
    )
    mobile_nav = frame(
        "Navbar",
        [
            frame(
                "Logo",
                [
                    frame(
                        "Mark",
                        [icon("shopping-bag", fill=GREEN, size=16)],
                        width=28,
                        height=28,
                        fill=SOFT_GREEN,
                        corner_radius=6,
                        justify="center",
                        align_items="center",
                    ),
                    txt("IntentCommerce", size=16, weight="700"),
                ],
                gap=8,
                align_items="center",
            ),
            frame(
                "Right",
                [
                    frame(
                        "Cart",
                        [
                            icon("shopping-cart", size=20),
                            frame("Badge", [txt("3", size=10, weight="700", fill="$text-inverse")], fill=GREEN, corner_radius=999, padding=[2, 6]),
                        ],
                        gap=4,
                        align_items="center",
                    ),
                    icon("menu", size=24),
                ],
                gap=12,
                align_items="center",
            ),
        ],
        width="fill_container",
        height=56,
        fill=CARD,
        stroke={"thickness": {"bottom": 1}, "fill": BORDER},
        padding=[0, 16],
        justify="space_between",
        align_items="center",
    )
    screens.append(
        {
            "type": "frame",
            "id": uid("mob"),
            "name": "Browse — Mobile /browse",
            "x": base_x,
            "y": base_y + gap_y,
            "width": 390,
            "height": 844,
            "fill": BG,
            "layout": "vertical",
            "clip": True,
            "children": [mobile_nav, mobile_body, floating_help()],
        }
    )

    # 3 Search active
    screens.append(
        screen_frame(
            "Browse — Search Active",
            desktop_catalog_body(search_query="university backpack"),
            x=base_x + gap_x,
            y=base_y,
            height=1300,
        )
    )

    # 4 Filtered
    screens.append(
        screen_frame(
            "Browse — Filtered",
            desktop_catalog_body(filtered=True),
            x=base_x + gap_x * 2,
            y=base_y,
            height=1300,
        )
    )

    # 5 Empty
    empty = screen_frame(
        "Browse — Empty",
        [
            frame(
                "EmptyWrap",
                [
                    catalog_header(show_discovery=False),
                    frame(
                        "EmptyCard",
                        [
                            frame("Illustration", [icon("package-search", size=48, fill=TEXT_SEC)], width=80, height=80, fill=SOFT_GREEN, corner_radius=40, justify="center", align_items="center"),
                            txt("No products found", size=22, weight="700"),
                            txt(
                                "Try changing your filters or describing what you need in a different way.",
                                size=14,
                                fill=TEXT_SEC,
                                width=400,
                            ),
                            frame(
                                "Actions",
                                [btn_primary("Clear filters"), btn_ghost("Search again")],
                                gap=12,
                            ),
                            frame(
                                "Suggestions",
                                [
                                    txt("Try:", size=13, fill=TEXT_SEC),
                                    chip("backpack under $60"),
                                    chip("wireless earbuds"),
                                    chip("home desk setup"),
                                ],
                                gap=8,
                                align_items="center",
                            ),
                        ],
                        fill=CARD,
                        corner_radius=20,
                        stroke={"thickness": 1, "fill": BORDER},
                        layout="vertical",
                        gap=16,
                        padding=40,
                        align_items="center",
                        width=480,
                    ),
                ],
                width="fill_container",
                layout="vertical",
                gap=32,
                padding=[32, 48],
                align_items="center",
            )
        ],
        x=base_x,
        y=base_y + gap_y * 2,
        height=900,
    )
    screens.append(empty)

    # 6 Loading skeleton
    def skel(w, h) -> dict:
        return frame("Skel", [], width=w, height=h, fill="#E7E2DA", corner_radius=8)

    skeleton = screen_frame(
        "Browse — Loading",
        [
            frame(
                "SkelBody",
                [
                    frame("SkelSide", [skel("fill_container", 24)] * 8, width=280, layout="vertical", gap=12, fill=CARD, corner_radius=16, padding=20),
                    frame(
                        "SkelMain",
                        [
                            skel(200, 16),
                            frame("SkelGrid", [skel("fill_container", 220) for _ in range(6)], width="fill_container", gap=16),
                        ],
                        width="fill_container",
                        layout="vertical",
                        gap=20,
                    ),
                ],
                width="fill_container",
                gap=24,
                padding=[24, 48],
            )
        ],
        x=base_x + gap_x,
        y=base_y + gap_y * 2,
        height=900,
    )
    screens.append(skeleton)

    # 7 Error
    screens.append(
        screen_frame(
            "Browse — Error",
            [
                frame(
                    "ErrorCard",
                    [
                        icon("alert-circle", size=40, fill=ERROR),
                        txt("Products couldn't load", size=22, weight="700"),
                        txt(
                            "Something went wrong while loading the catalog. Please try again.",
                            size=14,
                            fill=TEXT_SEC,
                            width=360,
                        ),
                        btn_primary("Retry"),
                    ],
                    fill=CARD,
                    corner_radius=20,
                    stroke={"thickness": 1, "fill": BORDER},
                    layout="vertical",
                    gap=16,
                    padding=40,
                    align_items="center",
                    width=420,
                )
            ],
            x=base_x + gap_x * 2,
            y=base_y + gap_y * 2,
            height=700,
        )
    )

    # 8 Add to cart success
    success_body = desktop_catalog_body()
    toast = frame(
        "Toast",
        [
            icon("check-circle", size=20, fill=SUCCESS),
            frame(
                "ToastText",
                [
                    txt("Added to cart", size=14, weight="600"),
                    txt("Everyday Campus Backpack", size=12, fill=TEXT_SEC),
                ],
                layout="vertical",
                gap=2,
            ),
            txt("View cart", size=13, weight="600", fill=GREEN),
        ],
        fill=CARD,
        corner_radius=12,
        stroke={"thickness": 1, "fill": BORDER},
        padding=[14, 18],
        gap=12,
        align_items="center",
        effect={"type": "shadow", "shadowType": "outer", "color": "#00000018", "offset": {"x": 0, "y": 4}, "blur": 20},
    )
    s8 = screen_frame(
        "Browse — Add to Cart",
        success_body,
        x=base_x + gap_x * 3,
        y=base_y,
        height=1300,
        extras=[toast],
    )
    screens.append(s8)

    # 9 Mobile filter drawer
    drawer = {
        "type": "frame",
        "id": uid("drw"),
        "name": "Browse — Mobile Filter Drawer",
        "x": base_x + gap_x,
        "y": base_y + gap_y,
        "width": 390,
        "height": 844,
        "fill": "#00000066",
        "clip": True,
        "children": [
            frame(
                "Sheet",
                [
                    frame("Handle", [], width=40, height=4, fill=BORDER, corner_radius=999),
                    txt("Filters", size=18, weight="700"),
                    filter_sidebar(),
                    frame(
                        "SheetActions",
                        [btn_primary("Show results"), btn_ghost("Clear")],
                        width="fill_container",
                        gap=10,
                    ),
                ],
                width="fill_container",
                fill=CARD,
                corner_radius=20,
                layout="vertical",
                gap=16,
                padding=20,
                align_items="center",
            )
        ],
        "layout": "vertical",
        "justifyContent": "end",
    }
    screens.append(drawer)

    # 10 Quick view drawer
    qv = {
        "type": "frame",
        "id": uid("qv"),
        "name": "Browse — Quick View",
        "x": base_x + gap_x * 2,
        "y": base_y + gap_y,
        "width": 1440,
        "height": 900,
        "fill": "#00000044",
        "clip": True,
        "children": [
            browse_navbar(),
            frame(
                "Overlay",
                [
                    frame(
                        "Drawer",
                        [
                            frame("Img", [], width="fill_container", height=240, fill=SOFT_GREEN, corner_radius=14),
                            badge("Best match"),
                            txt("Everyday Campus Backpack", size=20, weight="700"),
                            txt("by UrbanCart", size=14, fill=TEXT_SEC),
                            txt("$49.00", size=24, weight="700"),
                            txt("In stock · Ships in 2–3 days", size=13, fill=SUCCESS),
                            txt(
                                "Durable campus backpack with padded laptop sleeve and water-resistant fabric.",
                                size=13,
                                fill=TEXT_SEC,
                                width="fill_container",
                            ),
                            frame(
                                "Qty",
                                [
                                    txt("Qty", size=13, fill=TEXT_SEC),
                                    frame("Minus", [txt("−", size=16)], stroke={"thickness": 1, "fill": BORDER}, padding=[8, 14], corner_radius=8),
                                    txt("1", size=14, weight="600"),
                                    frame("Plus", [txt("+", size=16)], stroke={"thickness": 1, "fill": BORDER}, padding=[8, 14], corner_radius=8),
                                ],
                                gap=12,
                                align_items="center",
                            ),
                            btn_primary("Add to cart"),
                            txt("View full details", size=13, weight="600", fill=GREEN),
                        ],
                        width=400,
                        fill=CARD,
                        corner_radius=20,
                        stroke={"thickness": 1, "fill": BORDER},
                        layout="vertical",
                        gap=14,
                        padding=24,
                    )
                ],
                width="fill_container",
                height="fill_container",
                padding=[24, 48],
                justify="end",
            ),
        ],
        "layout": "vertical",
    }
    screens.append(qv)

    return screens


def find_components_frame(children: list) -> dict | None:
    for c in children:
        if c.get("name") == "Components":
            return c
    return None


def main() -> None:
    with open(PEN_PATH, encoding="utf-8") as f:
        doc = json.load(f)

    children: list = doc["children"]

    # Remove prior browse screens
    browse_prefixes = (
        "03 — Browse",
        "Browse —",
        "Browse \u2014",  # em dash variant
    )
    children = [
        c
        for c in children
        if not any(
            (c.get("name") or "").startswith(p) for p in browse_prefixes
        )
    ]
    doc["children"] = children

    # Add catalog card to Components if not present
    comp = find_components_frame(children)
    if comp:
        names = {c.get("name") for c in comp.get("children", [])}
        if "Catalog Row" not in names:
            comp.setdefault("children", []).append(
                frame(
                    "Catalog Row",
                    [catalog_product_card()],
                    gap=16,
                )
            )

    new_screens = build_screens()
    doc["children"].extend(new_screens)

    # Rename first screen to canonical route name
    for s in doc["children"]:
        if s.get("name") == "Browse — Desktop /browse":
            s["name"] = "03 — Browse /browse · Desktop"
            break

    with open(PEN_PATH, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2)
        f.write("\n")

    # Sync design copy
    design_pen = Path(__file__).resolve().parents[1] / "design" / "pencil-new.pen"
    if design_pen.exists():
        with open(design_pen, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2)
            f.write("\n")

    print(f"Added {len(new_screens)} browse screens to {PEN_PATH}")


if __name__ == "__main__":
    main()
