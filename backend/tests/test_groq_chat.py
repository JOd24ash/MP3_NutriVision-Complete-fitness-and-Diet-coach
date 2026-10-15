from app.rag import chat
import httpx
import pytest


def test_generate_answer_uses_groq_with_server_side_key(monkeypatch):
    captured = {}

    class Response:
        def raise_for_status(self):
            pass

        def json(self):
            return {"choices": [{"message": {"content": "Eat a balanced thali."}}]}

    def post(url, **kwargs):
        captured["url"] = url
        captured.update(kwargs)
        return Response()

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setattr(chat.httpx, "post", post)

    assert chat.generate_answer("CONTEXT: dal is a protein source") == "Eat a balanced thali."
    assert captured["url"] == "https://api.groq.com/openai/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["json"]["messages"][1]["content"] == "CONTEXT: dal is a protein source"


def test_generate_answer_reports_groq_failures_without_exposing_the_key(monkeypatch):
    request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
    response = httpx.Response(401, request=request)

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setattr(chat.httpx, "post", lambda *args, **kwargs: response)

    with pytest.raises(RuntimeError, match="HTTP 401") as error:
        chat.generate_answer("hello")

    assert "test-key" not in str(error.value)


def test_answer_chat_uses_grounded_local_reply_without_groq(monkeypatch):
    chunk = chat.RetrievedChunk(
        chunk_id="guide-1",
        source_title="ICMR Guide",
        text="Eat a variety of pulses, vegetables, and whole grains.",
    )
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.setattr(chat, "retrieve", lambda *_args, **_kwargs: [chunk])

    response = chat.answer_chat(
        chat.ChatRequest(user_id="user-1", message="How is my diet?"),
        user_profile={"goal": "gain", "diet_preference": "veg"},
    )

    assert "Gain weight / Build muscle" in response.answer
    assert "pulses" in response.answer
    assert response.sources[0].title == "ICMR Guide"


def test_build_prompt_includes_server_side_dashboard_data():
    prompt = chat.build_prompt(
        "How am I doing?", [], [],
        app_data={"dashboard": {"consumed_today": {"calories": 1200}}, "meal_history": [], "health_metrics": []},
    )

    assert "USER APP DATA:" in prompt
    assert '"calories": 1200' in prompt
