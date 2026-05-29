from sqlalchemy import Column, String, JSON, Boolean
from sqlalchemy.orm import relationship

from src.models.base import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    preferences = Column(JSON, nullable=True)

    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
