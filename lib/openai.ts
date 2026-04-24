import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openaiClient = apiKey
  ? new OpenAI({ apiKey })
  : null;

export async function healthcheckOpenAI() {
  if (!openaiClient) {
    return {
      ok: false,
      message: 'OPENAI_API_KEY no está configurada.'
    };
  }

  return {
    ok: true,
    message: 'Cliente OpenAI inicializado correctamente.'
  };
}
