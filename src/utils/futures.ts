import { Future, FutureData } from "../domain/entities/Future";
import { CancelableResponse } from "../types/d2-api";

export function apiToFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => reject(err ? err.message : "Unknown error"));
        return res.cancel;
    });
}

export function getJSON<Data>(url: string): FutureData<Data> {
    const abortController = new AbortController();

    return Future.fromComputation((resolve, reject) => {
        // exceptions: TypeError | DOMException[name=AbortError]
        fetch(url, { method: "get", signal: abortController.signal })
            .then(res => res.json() as Data) // exceptions: SyntaxError
            .then(data => resolve(data))
            .catch((error: unknown) => {
                if (isNamedError(error) && error.name === "AbortError") {
                    return reject("AbortError");
                } else if (error instanceof TypeError || error instanceof SyntaxError) {
                    reject(error.message);
                } else {
                    reject("Unknown error");
                }
            });

        return () => abortController.abort();
    });
}

function isNamedError(error: unknown): error is { name: string } {
    return Boolean(error && typeof error === "object" && "name" in error);
}
