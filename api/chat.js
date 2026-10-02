// Vercel Function: POST /api/chat — реплика ИИ, GET /api/chat — статус настройки.
// Ключи берутся из Environment Variables проекта на Vercel и в браузер не попадают.
import { handleChat } from '../server/chat.js'

export function GET(request) {
  return handleChat(request, process.env)
}

export function POST(request) {
  return handleChat(request, process.env)
}
