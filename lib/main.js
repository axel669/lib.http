// @ts-check
/** @import * as http from "./types.ts" */

/** @type {(config: http.OriginConfig, opt: http.Options) => http.CancellableRequest} */
const request = (config, opt) => {
    const { url, options } = opt
    const controller = new AbortController()
    const fetchOptions = {
        signal: controller.signal,
        ...options,
    }
    const request = config.fetch(url, fetchOptions)
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
export const build = (config, init) => {
    const { url, method, options } = init
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
            config.options,
            {
                ...rest,
                method,
                body: makeBody(json, body),
                headers: modifiedHeaders,
            }
        )
    }
}

/** @type {(method: http.Method, origin: http.OriginConfig) => http.RequestBuilder} */
const setupMethod = (method, config) =>
    (raw, ...values) => {
        const url = new URL(
            String.raw({ raw }, ...values),
            config.origin
        ).href
        return (options) => request(
            config,
            build(
                config,
                { url, method, options: options ?? {} }
            )
        )
    }

/** @type {http.OriginRequester} */
const initOrigin = (baseConfig = {}) => {
    const config = {
        origin: globalThis.location?.origin,
        options: {},
        fetch: (...args) => fetch(...args),
        ...baseConfig,
    }
    return {
        get: setupMethod("get", config),
        post: setupMethod("post", config),
        put: setupMethod("put", config),
        options: setupMethod("options", config),
        head: setupMethod("head", config),
        delete: setupMethod("delete", config),
        patch: setupMethod("patch", config),
    }
}

export default {
    req: initOrigin(),
    origin: initOrigin
}
