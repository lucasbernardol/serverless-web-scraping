import type { VercelRequest, VercelResponse } from '@vercel/node';

import Joi, { ValidationError, isError } from 'joi';
import { StatusCodes } from 'http-status-codes';

import scraper from 'metadata-scraper';

type RequestQueryParams = { href: string };

const schema = Joi.object<RequestQueryParams>({
	href: Joi.string().trim().max(2048).required(),
});

export default async function handle(
	request: VercelRequest,
	response: VercelResponse,
) {
	try {
		const query = request.query as RequestQueryParams;

		const { href } = await schema.validateAsync(query);

		const { title, description, icon, image, url, language } =
			await scraper(href); // html metadata

		return response.json({ title, icon, image, language, description, url });
	} catch (error: any) {
		if (error.name === 'RequestError') {
			// Got error
			response.status(StatusCodes.BAD_GATEWAY);

			return response.json({
				error: {
					name: 'HostError',
					message: 'Invalid host',
				},
			});
		}

		if (isError(error)) {
			const { name, message } = error as ValidationError;

			response.status(StatusCodes.BAD_REQUEST);

			return response.json({
				error: { name, message },
			});
		}

		return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			error: {
				message: 'Internal Server Error',
			},
		});
	}
}
