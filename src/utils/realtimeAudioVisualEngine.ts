// Unified Real-Time Audio-Visual Streaming, Gemini Live Continuous Interaction Engine

export type TurnState = 'idle' | 'listening' | 'user_speaking' | 'thinking' | 'speaking';
export type SpeechLang = 'en-IN' | 'hi-IN' | 'en-US';

export interface AudioVisualCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void;
  onTurnStateChange: (state: TurnState) => void;
  onAudioLevel: (level: number) => void;
  onJarvisSpeakStart: () => void;
  onJarvisSpeakEnd: () => void;
  onError?: (err: string) => void;
}

export class RealtimeAudioVisualPipeline {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private videoStream: MediaStream | null = null;
  private recognition: any = null;
  private isHandsFree: boolean = true;
  private turnState: TurnState = 'idle';
  private latestTranscript: string = '';
  private silenceTimer: any = null;
  private speakTimeoutTimer: any = null;
  private animFrameId: number | null = null;
  private isRunning: boolean = false;
  private isMutedForSpeech: boolean = false;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private lastProcessedUserText: string = '';
  private lastProcessedUserTime: number = 0;
  private currentLanguage: SpeechLang = 'en-IN';
  private callbacks: AudioVisualCallbacks;

  constructor(callbacks: AudioVisualCallbacks) {
    this.callbacks = callbacks;
  }

  public setLanguage(lang: SpeechLang) {
    this.currentLanguage = lang;
    if (this.recognition) {
      try {
        this.recognition.lang = lang;
      } catch (e) {}
    }
  }

  public getLanguage(): SpeechLang {
    return this.currentLanguage;
  }

  // Explicit User-Gesture Initialization for Continuous Gemini Live Interaction
  public async activatePipeline(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Safe AudioContext setup (always re-create if closed)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume().catch(() => {});
        }
      }

      // Resume SpeechSynthesis engine in browser
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        window.speechSynthesis.getVoices();
      }

      // 2. Request Microphone Stream with strict hardware Echo Cancellation
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          if (!this.mediaStream) {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
              audio: { 
                echoCancellation: true, 
                noiseSuppression: true, 
                autoGainControl: true 
              }, 
              video: false 
            });
          }
          if (this.audioContext && this.audioContext.state !== 'closed' && this.analyser && this.mediaStream) {
            try {
              const source = this.audioContext.createMediaStreamSource(this.mediaStream);
              source.connect(this.analyser);
              this.startAudioLevelAnalysis();
            } catch (srcErr) {
              console.warn('AudioSource connection handled gracefully:', srcErr);
            }
          }
        } catch (micErr: any) {
          console.warn('Microphone stream access error:', micErr);
        }
      }

      // 3. Setup Continuous Speech Recognition
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        if (!this.recognition) {
          this.recognition = new SpeechRec();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = this.currentLanguage;

          this.recognition.onstart = () => {
            if (!this.isMutedForSpeech && this.turnState !== 'speaking' && this.turnState !== 'thinking') {
              this.setTurnState('listening');
            }
          };

          this.recognition.onresult = (event: any) => {
            if (this.isMutedForSpeech || this.turnState === 'speaking' || this.turnState === 'thinking') {
              return;
            }

            let interim = '';
            let isFinal = false;

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const part = event.results[i][0].transcript;
              interim += part;
              if (event.results[i].isFinal) isFinal = true;
            }

            const cleanCandidate = interim.trim();
            if (!cleanCandidate) return;

            if (this.isEchoOfJarvis(cleanCandidate)) {
              return;
            }

            this.latestTranscript = cleanCandidate;
            this.setTurnState('user_speaking');
            this.callbacks.onTranscript(cleanCandidate, isFinal);

            // Fast Conversational Silence Detection (750ms for snappy Gemini Live speed)
            clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              const textToSend = this.latestTranscript.trim();
              if (textToSend && this.turnState === 'user_speaking' && !this.isMutedForSpeech) {
                if (this.isEchoOfJarvis(textToSend) || this.isDuplicateUserSpeech(textToSend)) {
                  this.latestTranscript = '';
                  this.setTurnState('listening');
                  return;
                }

                this.latestTranscript = '';
                this.lastProcessedUserText = textToSend.toLowerCase();
                this.lastProcessedUserTime = Date.now();
                this.callbacks.onTranscript(textToSend, true);
              }
            }, 750);
          };

          // Continuous Auto-Restart Loop
          this.recognition.onend = () => {
            if (this.isRunning && this.isHandsFree && !this.isMutedForSpeech && this.turnState !== 'speaking' && this.turnState !== 'thinking') {
              setTimeout(() => {
                try {
                  this.recognition?.start();
                } catch (e) {}
              }, 100);
            }
          };

          this.recognition.onerror = (e: any) => {
            if (e.error === 'not-allowed') {
              this.callbacks.onError?.('Microphone permission blocked. Please allow mic in browser settings.');
            }
            if (this.isRunning && this.isHandsFree && !this.isMutedForSpeech && this.turnState !== 'speaking' && this.turnState !== 'thinking') {
              setTimeout(() => {
                try {
                  this.recognition?.start();
                } catch (err) {}
              }, 200);
            }
          };
        }

        this.isRunning = true;
        this.startListening();
        return { success: true, message: 'Continuous Gemini Live Audio Pipeline Online' };
      }

      return { success: true, message: 'Web Speech API fallback enabled' };
    } catch (e: any) {
      console.error('Pipeline activate error:', e);
      return { success: false, message: e.message || 'Pipeline activation failed' };
    }
  }

  // Check if candidate speech is just the microphone hearing the speaker
  private isEchoOfJarvis(text: string): boolean {
    if (!this.lastSpokenText) return false;
    const now = Date.now();
    if (now - this.lastSpokenTime > 5000) return false;

    const lowerCandidate = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lowerJarvis = this.lastSpokenText.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!lowerCandidate) return true;
    
    if (lowerJarvis.includes(lowerCandidate) || lowerCandidate.includes(lowerJarvis)) {
      return true;
    }

    return false;
  }

  // Prevent rapid duplicate submissions
  private isDuplicateUserSpeech(text: string): boolean {
    const lower = text.toLowerCase();
    const now = Date.now();
    if (lower === this.lastProcessedUserText && now - this.lastProcessedUserTime < 3000) {
      return true;
    }
    return false;
  }

  // Real-time Audio Level & VAD analysis loop
  private startAudioLevelAnalysis() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkLevel = () => {
      if (this.analyser && this.isRunning && !this.isMutedForSpeech && this.audioContext && this.audioContext.state !== 'closed') {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.max(0, avg * 1.6));
        this.callbacks.onAudioLevel(normalized);

        // Barge-in check: If user makes loud sound while Jarvis is speaking, interrupt!
        if (this.turnState === 'speaking' && normalized > 45) {
          this.interruptSpeech();
        }
      } else {
        this.callbacks.onAudioLevel(0);
      }
      this.animFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();
  }

  // Instant User Interrupt (Barge-In)
  public interruptSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(this.speakTimeoutTimer);
    this.finishSpeaking();
  }

  // Start Live WebCam Video with auto-attach
  public async initVideo(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      if (this.videoStream) {
        this.stopVideo(videoElement);
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, min: 640 }, 
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        },
        audio: false,
      });

      if (videoElement) {
        videoElement.srcObject = this.videoStream;
        videoElement.muted = true;
        videoElement.playsInline = true;
        await videoElement.play().catch((err) => console.warn('Video play catch:', err));
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Video init error:', err);
      return false;
    }
  }

  public stopVideo(videoElement?: HTMLVideoElement | null) {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  public captureFrame(videoElement: HTMLVideoElement): string | undefined {
    if (!this.videoStream || !videoElement) return undefined;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.7);
      }
    } catch (e) {}
    return undefined;
  }

  // Start continuous listening
  public startListening() {
    if (this.isMutedForSpeech || this.turnState === 'speaking' || this.turnState === 'thinking') return;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    try {
      this.recognition?.start();
      this.setTurnState('listening');
    } catch (e) {}
  }

  // Stop listening
  public stopListening() {
    clearTimeout(this.silenceTimer);
    try {
      this.recognition?.abort();
    } catch (e) {}
    this.setTurnState('idle');
  }

  // High-Clarity Natural Vocalization (Gemini Voice Quality)
  public speak(text: string, persona: 'jarvis' | 'sec' | 'quantum' | 'solana' = 'jarvis') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.isMutedForSpeech = true;
    this.stopListening();
    clearTimeout(this.silenceTimer);
    clearTimeout(this.speakTimeoutTimer);

    this.setTurnState('speaking');
    this.callbacks.onJarvisSpeakStart();

    const clean = text.replace(/[*#`_\-\[\]\(\)]/g, '').replace(/https?:\/\/\S+/g, '');
    if (!clean.trim()) {
      this.finishSpeaking();
      return;
    }

    this.lastSpokenText = clean;
    this.lastSpokenTime = Date.now();

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    
    // Choose natural voice based on language and persona
    if (this.currentLanguage === 'hi-IN') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('hemant'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    } else {
      utterance.lang = 'en-US';
      if (persona === 'sec') {
        const femaleVoice = voices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 1.05;
        utterance.pitch = 1.15;
      } else if (persona === 'quantum') {
        const deepVoice = voices.find((v) => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('male'));
        if (deepVoice) utterance.voice = deepVoice;
        utterance.rate = 0.98;
        utterance.pitch = 0.85;
      } else {
        const naturalVoice = voices.find(
          (v) => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google')
        );
        if (naturalVoice) utterance.voice = naturalVoice;
        utterance.rate = 1.05;
        utterance.pitch = 0.98;
      }
    }

    utterance.onstart = () => {
      this.isMutedForSpeech = true;
      this.setTurnState('speaking');
      this.callbacks.onJarvisSpeakStart();
    };

    utterance.onend = () => {
      this.finishSpeaking();
    };

    utterance.onerror = () => {
      this.finishSpeaking();
    };

    window.speechSynthesis.speak(utterance);

    // Safety fallback timer
    const estimatedDurationMs = Math.max(2000, Math.min(12000, clean.length * 75 + 1000));
    this.speakTimeoutTimer = setTimeout(() => {
      if (this.turnState === 'speaking') {
        this.finishSpeaking();
      }
    }, estimatedDurationMs);
  }

  private finishSpeaking() {
    clearTimeout(this.speakTimeoutTimer);
    this.callbacks.onJarvisSpeakEnd();
    this.setTurnState('listening');

    // ECHO COOLDOWN: 800ms buffer after speech ends, then immediately resume listening
    setTimeout(() => {
      this.isMutedForSpeech = false;
      if (this.isRunning && this.isHandsFree && this.turnState !== 'speaking' && this.turnState !== 'thinking') {
        this.startListening();
      }
    }, 800);
  }

  public setTurnState(state: TurnState) {
    this.turnState = state;
    this.callbacks.onTurnStateChange(state);
  }

  public cleanup() {
    this.isRunning = false;
    this.isMutedForSpeech = true;
    clearTimeout(this.silenceTimer);
    clearTimeout(this.speakTimeoutTimer);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.mediaStream) this.mediaStream.getTracks().forEach((t) => t.stop());
    if (this.videoStream) this.videoStream.getTracks().forEach((t) => t.stop());
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
    }
    this.audioContext = null;
    this.analyser = null;
    try { this.recognition?.abort(); } catch (e) {}
    window.speechSynthesis?.cancel();
  }
}
