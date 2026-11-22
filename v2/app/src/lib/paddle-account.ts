import { verifyPaddleSignature } from './license/signature'

export type PaddleAccount = { secret: string; apiKey: string; apiBase: 'api' | 'sandbox-api' }

type Env = Record<string, string | undefined>

/** The Paddle accounts this deployment can receive webhooks from: the main one, plus the sandbox one for testers. */
export function paddleAccounts(e: Env): PaddleAccount[] {
  const list: PaddleAccount[] = []
  if (e.PADDLE_WEBHOOK_SECRET && e.PADDLE_API_KEY) {
    list.push({
      secret: e.PADDLE_WEBHOOK_SECRET,
      apiKey: e.PADDLE_API_KEY,
      apiBase: e.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'api' : 'sandbox-api',
    })
  }
  if (e.PADDLE_SANDBOX_WEBHOOK_SECRET && e.PADDLE_SANDBOX_API_KEY) {
    list.push({ secret: e.PADDLE_SANDBOX_WEBHOOK_SECRET, apiKey: e.PADDLE_SANDBOX_API_KEY, apiBase: 'sandbox-api' })
  }
  return list
}

/** The account whose secret signed this webhook (main first), or undefined when none did. */
export function pickPaddleAccount(
  accounts: PaddleAccount[],
  header: string | null,
  rawBody: string,
  nowMs?: number,
): PaddleAccount | undefined {
  return accounts.find((a) => verifyPaddleSignature(header, rawBody, a.secret, nowMs))
}
