from sqlalchemy import Column, String, JSON, Boolean
from sqlalchemy.orm import relationship

from src.models.base import Base, UUIDMixin, TimestampMixin


class Vendor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vendors"

    business_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    onboarding_complete = Column(Boolean, default=False)
    dashboard_config = Column(JSON, nullable=True)

    products = relationship("Product", back_populates="vendor")
