type VoiceHandlers = {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (msg: string) => void;
  onEnd?: () => void;
};

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function startVoice(handlers: VoiceHandlers): () => void {
  const w = typeof window !== 'undefined' ? (window as any) : null;
  const Ctor = w && (w.SpeechRecognition || w.webkitSpeechRecognition);
  if (!Ctor) {
    handlers.onError?.('Input suara tidak tersedia di perangkat ini.');
    return () => {};
  }

  const rec = new Ctor();
  rec.lang = 'id-ID';
  rec.interimResults = true;
  rec.continuous = false;

  rec.onresult = (event: any) => {
    let interim = '';
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += piece;
      else interim += piece;
    }
    if (interim) handlers.onPartial?.(interim);
    if (finalText) handlers.onFinal?.(finalText);
  };

  rec.onerror = () => {
    handlers.onError?.('Mikrofon gagal menangkap sinyal.');
    handlers.onEnd?.();
  };
  rec.onend = () => handlers.onEnd?.();

  try {
    rec.start();
  } catch {
    handlers.onError?.('Tidak bisa memulai input suara.');
    handlers.onEnd?.();
  }

  return () => {
    try {
      rec.stop();
    } catch {
      // already stopped
    }
  };
}
