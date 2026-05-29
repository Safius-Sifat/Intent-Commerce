"""
LangGraph Shopping Agent

State Graph:
INTENT_CLASSIFIER -> PRODUCT_RETRIEVER -> INVENTORY_CHECKER -> CART_MANAGER -> RESPONSE_FORMATTER
                          ^                                              |
                          |                                              |
                          +---------------- MISSING_INFO -----------------+

Checkout branch:
CHECKOUT_ORCHESTRATOR -> [collect address?] -> [collect payment?] -> CONFIRM_ORDER
"""

from typing import TypedDict, Annotated
import operator

from langgraph.graph import StateGraph, END


class AgentState(TypedDict):
    user_id: str
    session_id: str
    messages: Annotated[list, operator.add]
    intent: str | None
    retrieved_products: list
    cart_actions: list
    missing_info: list
    response: str | None


# ---- Node Functions (Stubs) ----

def classify_intent(state: AgentState) -> AgentState:
    # TODO: Use LLM to classify user intent
    state["intent"] = "search"
    return state


def retrieve_products(state: AgentState) -> AgentState:
    # TODO: Call hybrid RAG retrieval
    state["retrieved_products"] = []
    return state


def check_inventory(state: AgentState) -> AgentState:
    # TODO: Validate stock for retrieved products
    return state


def manage_cart(state: AgentState) -> AgentState:
    # TODO: Add/remove items based on intent
    return state


def format_response(state: AgentState) -> AgentState:
    # TODO: Generate natural language response
    state["response"] = "I'm here to help you shop! What are you looking for?"
    return state


# ---- Build Graph ----

workflow = StateGraph(AgentState)

workflow.add_node("classify_intent", classify_intent)
workflow.add_node("retrieve_products", retrieve_products)
workflow.add_node("check_inventory", check_inventory)
workflow.add_node("manage_cart", manage_cart)
workflow.add_node("format_response", format_response)

workflow.set_entry_point("classify_intent")
workflow.add_edge("classify_intent", "retrieve_products")
workflow.add_edge("retrieve_products", "check_inventory")
workflow.add_edge("check_inventory", "manage_cart")
workflow.add_edge("manage_cart", "format_response")
workflow.add_edge("format_response", END)

shopping_agent = workflow.compile()


async def run_agent(user_id: str, message: str, session_id: str) -> AgentState:
    initial_state: AgentState = {
        "user_id": user_id,
        "session_id": session_id,
        "messages": [{"role": "user", "content": message}],
        "intent": None,
        "retrieved_products": [],
        "cart_actions": [],
        "missing_info": [],
        "response": None,
    }
    return await shopping_agent.ainvoke(initial_state)
