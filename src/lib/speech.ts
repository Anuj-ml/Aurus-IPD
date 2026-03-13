import { Language } from '../types';
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'hi-IN', label: 'Hindi', nativeLabel: '??????' },
  { code: 'mr-IN', label: 'Marathi', nativeLabel: '?????' },
  { code: 'ta-IN', label: 'Tamil', nativeLabel: '?????' },
  { code: 'te-IN', label: 'Telugu', nativeLabel: '??????' },
  { code: 'bn-IN', label: 'Bengali', nativeLabel: '?????' },
  { code: 'gu-IN', label: 'Gujarati', nativeLabel: '???????' },
  { code: 'kn-IN', label: 'Kannada', nativeLabel: '?????' },
  { code: 'en-IN', label: 'English', nativeLabel: 'English' }
];
export const DEFAULT_AGENT_LANG: Language = { 
  code: 'en-IN', 
  label: 'English', 
  nativeLabel: 'English' 
};
export class SpeechHandler {
  private recognition: any = null;
  private synthesis = window.speechSynthesis;
  private _isSpeaking = false;
  private _isListening = false;
  private onInterruptCallback: (() => void) | null = null;
  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }
  isSupported(): boolean {
    return this.recognition !== null && 'speechSynthesis' in window;
  }
  isSpeaking(): boolean {
    return this._isSpeaking;
  }
  isListening(): boolean {
    return this._isListening;
  }
  startListening(
    langCode: string,
    onResult: (text: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (err: string) => void
  ): void {
    if (!this.recognition) {
      if (onError) onError("Speech recognition not supported in this browser.");
      return;
    }
    this.recognition.lang = langCode;
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };
    this.recognition.onend = () => {
      this._isListening = false;
      onEnd();
    };
    this.recognition.onerror = (event: any) => {
      this._isListening = false;
      if (onError) onError(event.error);
    };
    try {
      this._isListening = true;
      this.recognition.start();
    } catch (e: any) {
      this._isListening = false;
      if (onError) onError(e?.message || e?.toString());
    }
  }
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this._isListening = false;
    }
  }
  speak(
    text: string,
    langCode: string,
    onEnd?: () => void,
    onWord?: (charIndex: number) => void
  ): void {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }
    this.synthesis.cancel();
    this._isSpeaking = true;
    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
    let i = 0;
    const speakNext = () => {
      if (i >= sentences.length) {
        this._isSpeaking = false;
        if (onEnd) onEnd();
        return;
      }
      const s = sentences[i].trim();
      if (!s) { i++; speakNext(); return; }
      const u = new SpeechSynthesisUtterance(s);
      u.lang = langCode;
      u.onend = () => { i++; speakNext(); };
      u.onerror = (e) => { console.error('Error speaking', e); i++; speakNext(); };
      if (onWord) {
        u.onboundary = (e) => {
          if (e.name === 'word') onWord(e.charIndex);
        };
      }
      this.synthesis.speak(u);
    };
    speakNext();
  }
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this._isSpeaking = false;
    if (this.onInterruptCallback) {
      this.onInterruptCallback();
    }
  }
  setOnInterrupt(cb: () => void): void {
    this.onInterruptCallback = cb;
  }
}
export const speechHandler = new SpeechHandler();
