"""Email bodies — plain inline-styled HTML plus a text alternative.

Email clients ignore external CSS and most modern layout, so these stay
table-free single-column blocks with inline styles in the public site's
palette (dark gray ground, orange accent, mono chrome).
"""
from html import escape

from services.email_sender import OutgoingEmail, public_site_url

_BG = "#17191c"
_INK = "#f9f9f9"
_MUTE = "#a7a7a7"
_ORANGE = "#e85002"
_MONO = "'DM Mono', ui-monospace, Menlo, monospace"
_SANS = "Archivo, Helvetica, Arial, sans-serif"


def _shell(inner: str) -> str:
    return (
        f'<div style="background:{_BG};padding:32px 24px;font-family:{_SANS};color:{_INK}">'
        f'<div style="max-width:560px;margin:0 auto">'
        f'<div style="font-family:{_MONO};font-size:12px;letter-spacing:.18em;'
        f'text-transform:uppercase;color:{_ORANGE};margin-bottom:24px">The Garage AI</div>'
        f"{inner}</div></div>"
    )


def _button(href: str, label: str) -> str:
    return (
        f'<a href="{escape(href)}" style="display:inline-block;background:{_ORANGE};'
        f"color:#0a0a0a;font-family:{_MONO};font-size:13px;letter-spacing:.08em;"
        f'text-transform:uppercase;text-decoration:none;padding:12px 22px">{escape(label)}</a>'
    )


def confirmation_email(to: str, confirm_token: str) -> OutgoingEmail:
    link = f"{public_site_url()}/subscribe/confirm?token={confirm_token}"
    html = _shell(
        f'<h1 style="font-size:28px;line-height:1.1;margin:0 0 16px;color:{_INK}">'
        "Confirm your subscription.</h1>"
        f'<p style="font-size:16px;line-height:1.55;color:{_MUTE};margin:0 0 24px">'
        "One click and every new dispatch — the Monday Brief, the Thursday Deep Dive, "
        "the Friday Roundup — lands in your inbox.</p>"
        f"{_button(link, 'Confirm subscription')}"
        f'<p style="font-size:13px;line-height:1.5;color:{_MUTE};margin:28px 0 0">'
        "Didn't sign up? Ignore this email and you won't hear from us again.</p>"
    )
    text = (
        "Confirm your subscription to The Garage AI.\n\n"
        "Every new dispatch — the Monday Brief, the Thursday Deep Dive, the Friday "
        "Roundup — will land in your inbox.\n\n"
        f"Confirm: {link}\n\n"
        "Didn't sign up? Ignore this email and you won't hear from us again.\n"
    )
    return OutgoingEmail(
        to=to,
        subject="Confirm your Garage AI subscription",
        html=html,
        text=text,
    )
