const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Genera texto usando Gemini AI
 */
export const fetchGeminiText = async (prompt, systemPrompt = "Eres un asistente experto en gestión de parqueos.") => {
  if (!apiKey || apiKey === "tu_clave_aqui") {
    console.warn("VITE_GEMINI_API_KEY no está configurada en el archivo .env");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API Error');
      }
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      console.error(`Intento ${i + 1} fallido:`, err.message);
      if (i === 2) throw err;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

/**
 * Genera y reproduce audio usando Gemini AI (Experimental)
 */
export const fetchGeminiTTS = async (text) => {
  // Nota: gemini-2.0-flash-exp es el que soporta modalidades de audio más avanzadas
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoide" } } }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    const part = result.candidates?.[0]?.content?.parts?.[0];
    
    if (part?.inlineData) {
      const pcmData = part.inlineData.data;
      const sampleRate = parseInt(part.inlineData.mimeType.match(/rate=(\d+)/)?.[1] || "24000");
      return playPCM(pcmData, sampleRate);
    }
  } catch (err) {
    console.error("Error en Audio IA:", err);
  }
};

/**
 * Utilidad interna para reproducir datos PCM
 */
function playPCM(base64Data, sampleRate) {
  try {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + bytes.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, bytes.length * 2, true);

    const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
    const audio = new Audio(URL.createObjectURL(blob));
    return audio.play();
  } catch (e) {
    console.error("Error reproduciendo audio:", e);
  }
}