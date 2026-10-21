// Misma expresión que public.is_bot_user_agent (migración de estadísticas). Las visitas de
// bots se excluyen en SQL; aquí solo se evita insertarlas.
const BOT_PATTERN =
  /(bot\/|crawler|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp\/|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|skypeuripreview|embedly|headlesschrome|lighthouse)/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  return !!userAgent && BOT_PATTERN.test(userAgent);
}
