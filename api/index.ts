import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handle(
	request: VercelRequest,
	response: VercelResponse,
) {
	return response.json({ ok: true });
}
