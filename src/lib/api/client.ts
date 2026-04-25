import ky from 'ky';
import { tryRefreshToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('X-Correlation-Id', crypto.randomUUID());
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) return response;

        const refreshed = await tryRefreshToken();
        if (refreshed) return ky(request, options);

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return response;
      },
    ],
  },
});
