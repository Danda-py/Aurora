import app from '../server/app.ts';

export const config = {
	api: {
		bodyParser: false
	}
};

export default function handler(req: any, res: any) {
	return app(req, res);
}
