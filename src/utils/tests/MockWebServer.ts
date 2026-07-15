import { http, HttpResponse, RequestHandler } from "msw";
import { SetupServer, setupServer } from "msw/node";

export type Method = "get" | "post" | "put";

export interface MockHandler<T> {
    method: Method;
    endpoint: string;
    httpStatusCode: number;
    response: T | ((req: Request) => T);
}

export interface Request {
    headers: Record<string, string>;
    params: URLSearchParams;
    url: URL;
}

export class MockWebServer {
    server: SetupServer;

    lastRequest?: Request;
    allRequests?: Request[] = [];

    constructor() {
        this.server = setupServer();
    }

    start(): void {
        this.server.listen({ onUnhandledRequest: "bypass" });
    }

    resetHandlers(): void {
        this.server.resetHandlers();
        this.resetRequests();
    }

    resetRequests(): void {
        this.lastRequest = undefined;
        this.allRequests = [];
    }

    close(): void {
        this.server.close();
    }

    addRequestHandlers<T>(handlers: MockHandler<T>[]) {
        const mwsHandlers = handlers.map(handler => this.createMwsHandler(handler));
        this.server.use(...mwsHandlers);
    }

    createMwsHandler<T>(handler: MockHandler<T>): RequestHandler {
        const resolver = ({ request }: { request: globalThis.Request }) => {
            const mappedRequest = this.mapRequest(request);
            this.lastRequest = mappedRequest;
            this.allRequests?.push(mappedRequest);

            const body =
                typeof handler.response === "function" ? (handler.response as any)(mappedRequest) : handler.response;

            return typeof body === "string"
                ? new HttpResponse(body, { status: handler.httpStatusCode })
                : HttpResponse.json(body as any, { status: handler.httpStatusCode });
        };

        switch (handler.method) {
            case "get":
                return http.get(handler.endpoint, resolver);
            case "post":
                return http.post(handler.endpoint, resolver);
            case "put":
                return http.put(handler.endpoint, resolver);
        }
    }

    mapRequest(req: globalThis.Request): Request {
        const url = new URL(req.url);
        return {
            headers: Object.fromEntries(req.headers.entries()),
            params: url.searchParams,
            url,
        };
    }
}
