from sqlalchemy.ext.asyncio import AsyncSession


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process_message(self, user_id: str, message: str, session_id: str | None = None):
        # TODO: invoke LangGraph shopping agent
        return {"reply": "Agent response pending", "products": []}

    async def get_conversation_history(self, user_id: str, session_id: str):
        # TODO: load from DB
        return []
