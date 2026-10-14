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
