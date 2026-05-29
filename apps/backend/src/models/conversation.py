from sqlalchemy import Column, String, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship

from src.models.base import Base, UUIDMixin, TimestampMixin


class Conversation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "conversations"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    messages = Column(JSON, default=list)
    context_state = Column(JSON, nullable=True)

    user = relationship("User", back_populates="conversations")
