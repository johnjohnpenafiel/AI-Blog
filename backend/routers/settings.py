from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_api_key
from models import Setting
from schemas.settings import SettingsOut, SettingsUpdate

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    dependencies=[Depends(require_api_key)],
)


def _load_settings(db: Session) -> Setting:
    return db.query(Setting).filter(Setting.id == 1).one()


@router.get("", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)) -> Setting:
    return _load_settings(db)


@router.patch("", response_model=SettingsOut)
def update_settings(
    body: SettingsUpdate,
    db: Session = Depends(get_db),
) -> Setting:
    settings = _load_settings(db)
    data = body.model_dump(exclude_unset=True)
    if "publishing_mode" in data:
        settings.publishing_mode = data["publishing_mode"]
    db.commit()
    db.refresh(settings)
    return settings
