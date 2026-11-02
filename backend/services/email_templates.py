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


def post_email(
    to: str,
    unsubscribe_token: str,
    *,
    title: str,
    summary: str,
    slug: str,
    format: str | None,
    image_url: str | None,
) -> OutgoingEmail:
    """One published post, addressed to one subscriber (the unsubscribe link
    is per-subscriber, so every message is distinct)."""
    site = public_site_url()
    post_link = f"{site}/blog/{slug}"
    unsubscribe_link = f"{site}/unsubscribe?token={unsubscribe_token}"
    one_click = f"{site}/unsubscribe/one-click?token={unsubscribe_token}"
    kicker = format or "Dispatch"

    cover = (
        f'<a href="{escape(post_link)}"><img src="{escape(image_url)}" alt="" '
        f'width="560" style="display:block;width:100%;max-width:560px;height:auto;'
        f'border:0;margin:0 0 24px"></a>'
        if image_url
        else ""
    )
    html = _shell(
        f'<div style="font-family:{_MONO};font-size:12px;letter-spacing:.16em;'
        f'text-transform:uppercase;color:#d9c3ab;margin-bottom:14px">// {escape(kicker)}</div>'
        f"{cover}"
        f'<h1 style="font-size:28px;line-height:1.12;margin:0 0 16px">'
        f'<a href="{escape(post_link)}" style="color:{_INK};text-decoration:none">'
        f"{escape(title)}</a></h1>"
        f'<p style="font-size:16px;line-height:1.55;color:{_MUTE};margin:0 0 24px">'
        f"{escape(summary)}</p>"
        f"{_button(post_link, 'Read the dispatch')}"
        f'<p style="font-family:{_MONO};font-size:11px;line-height:1.6;letter-spacing:.06em;'
        f'color:#646464;margin:36px 0 0;border-top:1px solid #4a4a4a;padding-top:16px">'
        "You're getting this because you subscribed to The Garage AI. "
        f'<a href="{escape(unsubscribe_link)}" style="color:{_MUTE}">Unsubscribe</a></p>'
    )
    text = (
        f"// {kicker}\n\n{title}\n\n{summary}\n\n"
        f"Read the dispatch: {post_link}\n\n"
        "--\nYou're getting this because you subscribed to The Garage AI.\n"
        f"Unsubscribe: {unsubscribe_link}\n"
    )
    return OutgoingEmail(
        to=to,
        subject=title,
        html=html,
        text=text,
        # RFC 8058 one-click unsubscribe — Gmail/Yahoo require it for bulk
        # senders and show a native "Unsubscribe" button next to the sender.
        headers={
            "List-Unsubscribe": f"<{one_click}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
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
