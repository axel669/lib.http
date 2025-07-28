// @ts-check
/** @import * as http from "./types.ts" */

/** @type {(opt: http.Options) => http.CancellableRequest} */
const request = (opt) => {
    const { url, options } = opt
    const controller = new AbortController()
    const fetchOptions = {
        signal: controller.signal,
        ...options,
    }
    const request = fetch(url, fetchOptions)
    const promise =
        request
        .then(
            /** @type {(res: Response) => http.Complete | http.Incomplete} */
            (res) => {
                if (res.ok === true) {
                    return { state: "complete", res }
                }
                return { state: "incomplete", res }
            }
        )
        .catch(
            /** @type {(error: Error) => http.Fail | http.Cancel} */
            (error) => {
                if (error.name === "AbortError") {
                    return { state: "cancel" }
                }
                return { state: "fail", error }
            }
        )

    return {
        promise,
        abort: () => controller.abort(),
    }
}

/** @type {(value: any, body?: BodyInit | null) => BodyInit} */
const makeBody = (value, body) => {
    if (body !== undefined && body !== null) {
        return body
    }
    return JSON.stringify(value)
}
/** @type {(baseline: RequestInit, provided: RequestInit) => RequestInit} */
const mergeOptions = (baseline, provided) => ({
    ...baseline,
    ...provided,
    headers: {
        ...baseline.headers,
        ...provided.headers,
    }
})

/** @type {http.OptionsBuilder} */
export const build = (url, method, options = {}) => {
    const { json, body, type, headers, query, ...rest } = options
    const modifiedHeaders = {
        ...headers,
        ...(
            type !== undefined
            ? { "content-type": type }
            : {}
        )
    }
    const fullURL =
        (query === undefined)
        ? url
        : `${url}?${new URLSearchParams(query).toString()}`
    return {
        url: fullURL,
        options: mergeOptions(
            {},
            {
                ...rest,
                method,
                body: makeBody(json, body),
                headers: modifiedHeaders,
            }
        )
    }
}

/** @type {(method: http.Method, origin?: string) => http.RequestBuilder} */
const setupMethod = (method, origin) =>
    (raw, ...values) => {
        const url = new URL(
            String.raw({ raw }, ...values),
            origin
        ).href
        return (options) => request(
            build(url, method, options)
        )
    }

/** @type {(origin?: string) => { [key in http.Method]: http.RequestBuilder }} */
const initOrigin = (origin) => ({
    get: setupMethod("get", origin),
    post: setupMethod("post", origin),
    put: setupMethod("put", origin),
    options: setupMethod("options", origin),
    head: setupMethod("head", origin),
    delete: setupMethod("delete", origin),
    patch: setupMethod("patch", origin),
})

export default {
    req: initOrigin(),
    origin: initOrigin
}
