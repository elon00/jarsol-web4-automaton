"""Shared LLM bridge: prefer Google Gemini, fall back to OpenRouter.

Provides a thin compatibility layer so call sites can keep using a
`model.generate_content(...)` style API without depending on the deprecated
`google.generativeai` package.
"""

from __future__ import annotations

import base64
import io
import json
import sys
import warnings
from pathlib import Path
from typing import Any, Optional


def _base_dir() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).parent
    return Path(__file__).resolve().parent


def _load_keys() -> dict:
    path = _base_dir() / "config" / "api_keys.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def gemini_key_valid(key: str) -> bool:
    key = (key or "").strip()
    return key.startswith("AIza") and len(key) >= 30


class _Response:
    def __init__(self, text: str) -> None:
        self.text = text or ""


class _GeminiModel:
    """Wraps google.genai Client to look like the old GenerativeModel."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "gemini-2.5-flash",
        system_instruction: str = "",
    ) -> None:
        from google import genai
        from google.genai import types

        self._client = genai.Client(api_key=api_key)
        self._types = types
        self._model = model_name
        self._system = system_instruction or ""

    def generate_content(self, content: Any) -> _Response:
        parts = self._to_parts(content)
        kwargs: dict[str, Any] = {"model": self._model, "contents": parts}
        if self._system:
            kwargs["config"] = self._types.GenerateContentConfig(
                system_instruction=self._system
            )
        response = self._client.models.generate_content(**kwargs)
        text = getattr(response, "text", None) or ""
        if not text and getattr(response, "candidates", None):
            try:
                text = response.candidates[0].content.parts[0].text
            except Exception:
                text = str(response)
        return _Response(text)

    def _to_parts(self, content: Any) -> list:
        """Normalise str / list / PIL image inputs into genai content parts."""
        if not isinstance(content, (list, tuple)):
            content = [content]

        parts: list = []
        for item in content:
            if item is None:
                continue
            if isinstance(item, str):
                parts.append(item)
                continue
            # PIL Image
            if hasattr(item, "save") and hasattr(item, "mode"):
                buf = io.BytesIO()
                fmt = "PNG" if item.mode == "RGBA" else "JPEG"
                item.save(buf, format=fmt)
                mime = "image/png" if fmt == "PNG" else "image/jpeg"
                parts.append(
                    self._types.Part.from_bytes(data=buf.getvalue(), mime_type=mime)
                )
                continue
            parts.append(str(item))
        return parts


class _OpenRouterModel:
    """OpenRouter-backed stand-in for GenerativeModel.generate_content."""

    def __init__(
        self,
        model_name: str = "openrouter",
        system_instruction: str = "",
    ) -> None:
        from or_client import OpenRouterClient

        self._client = OpenRouterClient()
        self._model = model_name
        self._system = system_instruction or (
            "You are a component of JARVIS. Be precise, thorough, "
            "and return only the requested analysis."
        )

    def generate_content(self, content: Any) -> _Response:
        prompt, image_b64, mime = self._split_content(content)
        if image_b64:
            text = self._client.vision(
                prompt or "Describe this image.",
                image_b64,
                mime=mime,
                system=self._system,
            )
        else:
            text = self._client.chat(
                prompt or "",
                system=self._system,
            )
        return _Response(text)

    def _split_content(self, content: Any) -> tuple[str, Optional[str], str]:
        if not isinstance(content, (list, tuple)):
            content = [content]

        texts: list[str] = []
        image_b64: Optional[str] = None
        mime = "image/png"

        for item in content:
            if item is None:
                continue
            if isinstance(item, str):
                texts.append(item)
                continue
            if hasattr(item, "save") and hasattr(item, "mode"):
                buf = io.BytesIO()
                fmt = "PNG" if getattr(item, "mode", "") == "RGBA" else "JPEG"
                item.save(buf, format=fmt)
                mime = "image/png" if fmt == "PNG" else "image/jpeg"
                image_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
                continue
            texts.append(str(item))

        return "\n".join(texts).strip(), image_b64, mime


class _FallbackModel:
    """Try Gemini first; on auth/network failure use OpenRouter."""

    def __init__(self, primary: Any, fallback: Any) -> None:
        self._primary = primary
        self._fallback = fallback

    def generate_content(self, content: Any) -> _Response:
        if self._primary is not None:
            try:
                return self._primary.generate_content(content)
            except Exception as e:
                msg = f"{type(e).__name__} {e}".lower()
                authish = any(
                    m in msg
                    for m in (
                        "401",
                        "403",
                        "unauthenticated",
                        "invalid api key",
                        "api_key",
                        "permission",
                        "not found",
                        "404",
                    )
                )
                if not authish and self._fallback is None:
                    raise
                print(f"[llm_bridge] Gemini failed ({e}); falling back to OpenRouter.")
        if self._fallback is None:
            raise RuntimeError("No LLM backend available (Gemini and OpenRouter both unavailable).")
        return self._fallback.generate_content(content)


def get_text_model(
    model_name: str = "gemini-2.5-flash",
    system_instruction: str = "",
) -> Any:
    """Return a model object with `.generate_content(content) -> .text`."""
    keys = _load_keys()
    gemini_key = (keys.get("gemini_api_key") or "").strip()
    or_key = (keys.get("openrouter_api_key") or "").strip()

    primary = None
    if gemini_key_valid(gemini_key):
        try:
            primary = _GeminiModel(
                gemini_key,
                model_name=model_name,
                system_instruction=system_instruction,
            )
        except Exception as e:
            print(f"[llm_bridge] Could not init Gemini: {e}")

    fallback = None
    if or_key:
        try:
            fallback = _OpenRouterModel(system_instruction=system_instruction)
        except Exception as e:
            print(f"[llm_bridge] Could not init OpenRouter: {e}")

    if primary is None and fallback is None:
        # Last resort: try deprecated package if still installed (with warning suppressed)
        if gemini_key:
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore", FutureWarning)
                    import google.generativeai as genai_old

                    genai_old.configure(api_key=gemini_key)
                    kwargs = {"model_name": model_name}
                    if system_instruction:
                        kwargs["system_instruction"] = system_instruction
                    return genai_old.GenerativeModel(**kwargs)
            except Exception:
                pass
        raise RuntimeError(
            "No working LLM backend. Set a valid gemini_api_key (AIza…) "
            "or openrouter_api_key in config/api_keys.json."
        )

    if primary is not None and fallback is not None:
        return _FallbackModel(primary, fallback)
    return primary or fallback
