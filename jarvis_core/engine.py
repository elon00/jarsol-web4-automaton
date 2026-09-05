"""Jarvis conversation engine.

Provides a clean, pluggable engine abstraction so the assistant can talk through
multiple backends and degrade gracefully:

  * GroqEngine        -> high-speed Llama 3.3 text + Whisper voice via Groq API.
  * GeminiLiveEngine  -> real-time voice via Google Gemini Live.
  * OpenRouterEngine  -> text conversation through OpenRouter free models (Llama, etc.),
                         with offline Windows TTS and sounddevice STT.
"""

from __future__ import annotations

import asyncio
import io
import json
import os
import sys
import threading
import time
import traceback
import wave
from pathlib import Path
from typing import Callable, Optional

# Force UTF-8 on Windows consoles so emoji logs never crash the loop.
if sys.stdout and getattr(sys.stdout, "encoding", "") and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


BASE_DIR = Path(__file__).resolve().parent
API_CONFIG_PATH = BASE_DIR / "config" / "api_keys.json"


def _load_config() -> dict:
    try:
        return json.loads(API_CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _gemini_key_valid(key: str) -> bool:
    if not key:
        return False
    return key.startswith("AIza") and len(key) >= 30


class TTS:
    """Offline text-to-speech using the OS voice (SAPI on Windows)."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._ready = False
        try:
            import pyttsx3

            self._pyttsx3 = pyttsx3
            self._ready = True
        except Exception as e:
            print(f"[TTS] unavailable: {e}")
            self._ready = False

    @property
    def ready(self) -> bool:
        return self._ready

    def speak(self, text: str) -> None:
        if not self._ready or not text:
            return
        text = str(text).strip()
        sentences = [s for s in text.replace("\n", ". ").split(". ") if s.strip()]
        spoken = ". ".join(sentences[:6]).strip()
        if not spoken:
            return
        try:
            with self._lock:
                try:
                    import pythoncom
                    pythoncom.CoInitialize()
                except Exception:
                    pass
                engine = self._pyttsx3.init()
                engine.setProperty("rate", 175)
                voices = engine.getProperty("voices") or []
                for v in voices:
                    if "zira" in v.id.lower() or "female" in v.id.lower():
                        engine.setProperty("voice", v.id)
                        break
                engine.say(spoken)
                engine.runAndWait()
                try:
                    engine.stop()
                except Exception:
                    pass
        except Exception as e:
            print(f"[TTS speak error] {e}")


class STT:
    """Local/online speech-to-text using sounddevice (no PyAudio required)."""

    def __init__(self, sample_rate: int = 16000) -> None:
        self.sample_rate = sample_rate
        self._sr = None
        self._sd = None
        self._np = None
        self._recognizer = None
        self._ready = False
        try:
            import speech_recognition as sr
            import sounddevice as sd
            import numpy as np

            self._sr = sr
            self._sd = sd
            self._np = np
            self._recognizer = sr.Recognizer()
            self._ready = True
        except Exception as e:
            print(f"[STT] unavailable: {e}")
            self._ready = False

    @property
    def ready(self) -> bool:
        return self._ready

    def record_pcm(self, timeout: float = 6.0, phrase_time: float = 8.0) -> Optional[bytes]:
        """Record audio from default mic using sounddevice with ambient noise calibration."""
        if not self._ready:
            return None

        sample_rate = self.sample_rate
        chunk_duration = 0.1  # 100ms
        chunk_samples = int(sample_rate * chunk_duration)

        try:
            with self._sd.InputStream(samplerate=sample_rate, channels=1, dtype="int16") as stream:
                # Calibrate noise
                noise_energy = 0.0
                for _ in range(3):
                    data, overflow = stream.read(chunk_samples)
                    energy = float(self._np.abs(data).mean())
                    noise_energy = max(noise_energy, energy)

                threshold = max(noise_energy * 2.2, 350.0)

                audio_chunks = []
                silence_counter = 0.0
                speech_started = False
                total_time = 0.0

                while total_time < (timeout if not speech_started else 15.0):
                    data, overflow = stream.read(chunk_samples)
                    energy = float(self._np.abs(data).mean())
                    total_time += chunk_duration

                    if energy > threshold:
                        speech_started = True
                        silence_counter = 0.0
                        audio_chunks.append(data)
                    elif speech_started:
                        silence_counter += chunk_duration
                        audio_chunks.append(data)
                        if silence_counter >= 1.2:
                            break

                if not speech_started or not audio_chunks:
                    return None

                recording = self._np.concatenate(audio_chunks, axis=0)
                return recording.tobytes()

        except Exception as e:
            # Handle mic stream or device errors quietly
            return None

    def listen_once(self, timeout: float = 6.0, phrase_time: float = 8.0) -> Optional[str]:
        """Listen for a single utterance using sounddevice + Google Speech Recognition."""
        pcm = self.record_pcm(timeout, phrase_time)
        if not pcm:
            return None

        try:
            audio_data = self._sr.AudioData(pcm, self.sample_rate, 2)
            return self._recognizer.recognize_google(audio_data)
        except self._sr.UnknownValueError:
            return None
        except self._sr.RequestError:
            # Network connection error for Google STT
            return None
        except Exception as e:
            return None


class JarvisEngine:
    """Base engine. Subclasses implement the conversation entry point."""

    name = "base"

    def __init__(self, ui, tts: TTS, stt: STT, system_prompt: str, memory_fn=None) -> None:
        self.ui = ui
        self.tts = tts
        self.stt = stt
        self.system_prompt = system_prompt
        self.memory_fn = memory_fn

    def on_user_text(self, text: str) -> None:
        raise NotImplementedError

    def _log(self, who: str, text: str) -> None:
        try:
            self.ui.write_log(f"{who}: {text}")
        except Exception:
            pass

    def _state(self, state: str) -> None:
        try:
            self.ui.set_state(state)
        except Exception:
            pass

    def _remember(self, user_text: str, jarvis_text: str) -> None:
        if self.memory_fn:
            try:
                threading.Thread(target=self.memory_fn, args=(user_text, jarvis_text), daemon=True).start()
            except Exception:
                pass

    def start_voice_listen(self) -> None:
        """Spin a background thread that listens to the mic continuously."""
        if not self.stt.ready:
            return

        def _loop():
            while True:
                if not getattr(self.ui, "muted", False):
                    self._state("LISTENING")
                    text = self.stt.listen_once()
                    if text:
                        self.on_user_text(text)
                else:
                    time.sleep(0.5)

        threading.Thread(target=_loop, daemon=True).start()


class OpenRouterEngine(JarvisEngine):
    """Text conversation via OpenRouter + offline TTS + sounddevice STT."""

    name = "OpenRouter"

    def __init__(self, ui, tts: TTS, stt: STT, system_prompt: str, memory_fn=None) -> None:
        super().__init__(ui, tts, stt, system_prompt, memory_fn)
        from or_client import OpenRouterClient

        self.client = OpenRouterClient()
        self.history: list[dict] = [{"role": "system", "content": system_prompt}]
        self._busy = threading.Lock()

    def _reply(self, user_text: str) -> str:
        self.history.append({"role": "user", "content": user_text})
        if len(self.history) > 24:
            self.history = [self.history[0]] + self.history[-22:]
        try:
            out = self.client.multi_turn(self.history)
        except Exception as e:
            out = f"Sir, I hit an issue reaching my brain: {e}"
        self.history.append({"role": "assistant", "content": out})
        return out

    def on_user_text(self, text: str) -> None:
        text = (text or "").strip()
        if not text:
            return
        if not self._busy.acquire(blocking=False):
            return
        try:
            self._state("THINKING")
            self._log("You", text)
            reply = self._reply(text)
            self._state("SPEAKING")
            self._log("Jarvis", reply)
            threading.Thread(target=self.tts.speak, args=(reply,), daemon=True).start()
            self._remember(text, reply)
        finally:
            self._busy.release()
            if not getattr(self.ui, "muted", False):
                self._state("LISTENING")


class GroqEngine(JarvisEngine):
    """Voice and text conversation via Groq (Llama 3.3 + Whisper)."""

    name = "Groq Llama Voice"

    def __init__(self, ui, tts: TTS, stt: STT, system_prompt: str, memory_fn=None, api_key: str = "") -> None:
        super().__init__(ui, tts, stt, system_prompt, memory_fn)
        from groq import Groq

        self.client = Groq(api_key=api_key)
        self.history: list[dict] = [{"role": "system", "content": system_prompt}]
        self._busy = threading.Lock()

    def _listen_whisper(self, timeout: float = 6.0, phrase_time: float = 8.0) -> Optional[str]:
        pcm = self.stt.record_pcm(timeout, phrase_time)
        if not pcm:
            return None
        try:
            buf = io.BytesIO()
            with wave.open(buf, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(self.stt.sample_rate)
                wf.writeframes(pcm)
            wav_bytes = buf.getvalue()

            transcription = self.client.audio.transcriptions.create(
                file=("speech.wav", wav_bytes),
                model="whisper-large-v3-turbo",
                response_format="text",
            )
            if isinstance(transcription, str):
                return transcription.strip()
            return getattr(transcription, "text", str(transcription)).strip()
        except Exception as e:
            print(f"[Groq STT] {e}")
            return None

    def start_voice_listen(self) -> None:
        if not self.stt.ready:
            return

        def _loop():
            while True:
                if not getattr(self.ui, "muted", False):
                    self._state("LISTENING")
                    text = self._listen_whisper()
                    if text:
                        self.on_user_text(text)
                else:
                    time.sleep(0.5)

        threading.Thread(target=_loop, daemon=True).start()

    def _reply(self, user_text: str) -> str:
        self.history.append({"role": "user", "content": user_text})
        if len(self.history) > 24:
            self.history = [self.history[0]] + self.history[-22:]
        try:
            completion = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history,
                temperature=0.7,
                max_tokens=1024,
            )
            out = completion.choices[0].message.content
        except Exception as e:
            out = f"Sir, I hit an issue reaching my Groq brain: {e}"
        self.history.append({"role": "assistant", "content": out})
        return out

    def on_user_text(self, text: str) -> None:
        text = (text or "").strip()
        if not text:
            return
        if not self._busy.acquire(blocking=False):
            return
        try:
            self._state("THINKING")
            self._log("You", text)
            reply = self._reply(text)
            self._state("SPEAKING")
            self._log("Jarvis", reply)
            threading.Thread(target=self.tts.speak, args=(reply,), daemon=True).start()
            self._remember(text, reply)
        finally:
            self._busy.release()
            if not getattr(self.ui, "muted", False):
                self._state("LISTENING")


class GeminiLiveEngine(JarvisEngine):
    """Real-time voice engine via Google Gemini Live."""

    name = "Gemini Live"

    SEND_SAMPLE_RATE = 16000
    RECEIVE_SAMPLE_RATE = 24000
    CHANNELS = 1
    CHUNK_SIZE = 1024

    def __init__(
        self,
        ui,
        tts: TTS,
        stt: STT,
        system_prompt: str,
        memory_fn=None,
        api_key: str = "",
        model: str = "",
    ) -> None:
        super().__init__(ui, tts, stt, system_prompt, memory_fn)
        from google import genai
        from google.genai import types

        self._genai = genai
        self._types = types
        self.api_key = api_key
        self.model = model or "models/gemini-2.5-flash-native-audio-preview-12-2025"
        self.session = None
        self._loop = None
        self.audio_in_queue = None
        self.out_queue = None

    def _build_config(self):
        from datetime import datetime
        from memory.memory_manager import load_memory, format_memory_for_prompt

        memory = load_memory()
        mem_str = format_memory_for_prompt(memory)
        now = datetime.now()
        time_str = now.strftime("%A, %B %d, %Y — %I:%M %p")
        time_ctx = f"[CURRENT DATE & TIME]\nRight now it is: {time_str}\n\n"
        parts = [time_ctx]
        if mem_str:
            parts.append(mem_str)
        parts.append(self.system_prompt)
        return self._types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            output_audio_transcription={},
            input_audio_transcription={},
            system_instruction="\n".join(parts),
            session_resumption=self._types.SessionResumptionConfig(),
            speech_config=self._types.SpeechConfig(
                voice_config=self._types.VoiceConfig(
                    prebuilt_voice_config=self._types.PrebuiltVoiceConfig(voice_name="Charon")
                )
            ),
        )

    def on_user_text(self, text: str) -> None:
        if not self._loop or not self.session:
            return
        asyncio.run_coroutine_threadsafe(
            self.session.send_client_content(
                turns={"parts": [{"text": text}]}, turn_complete=True
            ),
            self._loop,
        )

    async def _listen_audio(self):
        import sounddevice as sd

        loop = asyncio.get_event_loop()

        def callback(indata, frames, time_info, status):
            if not getattr(self.ui, "muted", False):
                data = indata.tobytes()
                loop.call_soon_threadsafe(
                    self.out_queue.put_nowait, {"data": data, "mime_type": "audio/pcm"}
                )

        with sd.InputStream(
            samplerate=self.SEND_SAMPLE_RATE,
            channels=self.CHANNELS,
            dtype="int16",
            blocksize=self.CHUNK_SIZE,
            callback=callback,
        ):
            while True:
                await asyncio.sleep(0.1)

    async def _receive_audio(self):
        out_buf, in_buf = [], []
        async for response in self.session.receive():
            if response.data:
                self.audio_in_queue.put_nowait(response.data)
            if response.server_content:
                sc = response.server_content
                if sc.output_transcription and sc.output_transcription.text:
                    txt = sc.output_transcription.text.strip()
                    if txt:
                        out_buf.append(txt)
                if sc.input_transcription and sc.input_transcription.text:
                    txt = sc.input_transcription.text.strip()
                    if txt:
                        in_buf.append(txt)
                if sc.turn_complete:
                    full_in = " ".join(in_buf).strip()
                    full_out = " ".join(out_buf).strip()
                    if full_in:
                        self._log("You", full_in)
                    if full_out:
                        self._log("Jarvis", full_out)
                        threading.Thread(
                            target=self.tts.speak, args=(full_out,), daemon=True
                        ).start()
                        self._remember(full_in, full_out)
                    in_buf.clear()
                    out_buf.clear()
                    if not getattr(self.ui, "muted", False):
                        self._state("LISTENING")

    async def _play_audio(self):
        import sounddevice as sd

        stream = sd.RawOutputStream(
            samplerate=self.RECEIVE_SAMPLE_RATE,
            channels=self.CHANNELS,
            dtype="int16",
            blocksize=self.CHUNK_SIZE,
        )
        stream.start()
        try:
            while True:
                chunk = await self.audio_in_queue.get()
                self._state("SPEAKING")
                await asyncio.to_thread(stream.write, chunk)
        finally:
            stream.stop()
            stream.close()
            self._state("LISTENING")

    async def run(self):
        client = self._genai.Client(
            api_key=self.api_key, http_options={"api_version": "v1beta"}
        )
        config = self._build_config()
        print("[JARVIS] Connecting to Gemini Live...")
        async with client.aio.live.connect(model=self.model, config=config) as session:
            self.session = session
            self._loop = asyncio.get_event_loop()
            self.audio_in_queue = asyncio.Queue()
            self.out_queue = asyncio.Queue(maxsize=10)
            print("[JARVIS] Gemini Live connected.")
            self._state("LISTENING")
            self._log("SYS", "JARVIS online (voice mode).")
            async with asyncio.TaskGroup() as tg:
                tg.create_task(self._listen_audio())
                tg.create_task(self._receive_audio())
                tg.create_task(self._play_audio())


def build_engine(
    ui, tts: TTS, stt: STT, system_prompt: str, memory_fn=None
) -> JarvisEngine:
    """Pick the best available engine and return it.

    Order: 1) Groq Llama, 2) Gemini Live if a valid Gemini key exists, 3) OpenRouter otherwise.
    """
    cfg = _load_config()
    groq_key = (cfg.get("groq_api_key") or "").strip()
    gemini_key = (cfg.get("gemini_api_key") or "").strip()
    openrouter_key = (cfg.get("openrouter_api_key") or "").strip()

    if groq_key:
        print("[JARVIS] Groq key present - using Groq Llama Voice engine.")
        return GroqEngine(ui, tts, stt, system_prompt, memory_fn, api_key=groq_key)

    if _gemini_key_valid(gemini_key):
        print("[JARVIS] Gemini key present - using realtime voice engine.")
        return GeminiLiveEngine(ui, tts, stt, system_prompt, memory_fn, api_key=gemini_key)

    if openrouter_key:
        if not _gemini_key_valid(gemini_key):
            print("[JARVIS] Gemini key missing/invalid - voice mode disabled.")
            print("[JARVIS] Using OpenRouter text engine with offline TTS + mic input.")
        return OpenRouterEngine(ui, tts, stt, system_prompt, memory_fn)

    raise RuntimeError(
        "No API keys configured. Add 'groq_api_key', 'openrouter_api_key' (or a valid "
        "'gemini_api_key') to config/api_keys.json."
    )
