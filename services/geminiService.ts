import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

// Initialize the client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SAMPLE_RATE = 24000;

// Helper: Decode base64 string to Uint8Array
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Convert raw PCM (Int16) to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(numChannels, frameCount, SAMPLE_RATE);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

// Helper: Create WAV Header for downloading
function createWavHeader(dataLength: number): Uint8Array {
  const numChannels = 1;
  const sampleRate = SAMPLE_RATE;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true); // ChunkSize
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true); // Subchunk2Size

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Helper: Combine header and data for blob creation
export function createWavBlob(pcmData: Uint8Array): Blob {
  const header = createWavHeader(pcmData.length);
  return new Blob([header, pcmData], { type: 'audio/wav' });
}

export interface TTSResult {
  audioBuffer: AudioBuffer;
  rawPcm: Uint8Array;
}

/**
 * Generates speech from text using Gemini TTS.
 */
export const generateSpeech = async (
  text: string,
  voiceName: VoiceName = 'Kore'
): Promise<TTSResult> => {
  const client = getAiClient();

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!base64Audio) {
    throw new Error("No audio data returned from API");
  }

  const rawPcm = decodeBase64(base64Audio);
  
  // We need an AudioContext to decode into a playable AudioBuffer
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: SAMPLE_RATE
  });
  
  const audioBuffer = await decodeAudioData(rawPcm, audioContext);
  await audioContext.close(); // Close context as we just used it for decoding

  return { audioBuffer, rawPcm };
};
