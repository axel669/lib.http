import { Ok, Err, tryableAsync } from "@axel669/result"

const standardFetch = (...args) => fetch(...args)
const composeBody = (json, body) => {
    if (json !== undefined) {
        return [
            { "Content-Type": "application/json" },
            JSON.stringify(json)
        ]
    }
    return [{}, body]
}
const res = {
    json: res => res.json(),
    text: res => res.text(),
    formData: res => res.formData(),
    blob: res => res.blob(),
    bytes: res => res.bytes(),
    arrayBuffer: res => res.arrayBuffer(),
    raw: res => res.body,
}
const sendreq = (options) => {
    const controller = new AbortController()
    const {
        url,
        query,
        parse = res.text,
        errorParse = res.text,
        fetch,
        headers,
        json,
        body,
        ...opts
    } = options

    const [contentType, bodyData] = composeBody(json, body)
    const queryString =
        (query === undefined)
        ? ""
        : `?${new URLSearchParams(query).toString()}`
    const fullURL = `${url}${queryString}`
    const fetchOptions = {
        ...opts,
        headers: {
            ...options.headers,
            ...contentType,
        },
        signal: controller.signal,
        body: bodyData,
    }

    const req =
        fetch(fullURL, fetchOptions)
        .then(async (response) => {
            if (response.ok === false) {
                const error = await errorParse(response)
                return Err(error).addMeta({
                    state: "incomplete",
                    status: response.status,
                    response,
                })
            }
            const data = await parse(response)
            return Ok(data).addMeta({
                state: "complete",
                fullURL,
                response,
            })
        })
        .catch(error => {
            const result = Err(error)
            if (error.name === "AbortError") {
                return result.addMeta({
                    state: "abort"
                })
            }
            return result.addMeta({
                state: "fail"
            })
        })
    req.abort = () => controller.abort()
    return req
}
const withoutBody = (config, method) =>
    (options) => sendreq({
        ...config.defOpts,
        ...options,
        method,
        headers: { ...config.headers, ...options.headers },
        url: new URL(options.url, config.origin),
        fetch,
    })
const withBody = (config, method) =>
    (options) => sendreq({
        ...config.defOpts,
        ...options,
        method,
        headers: { ...config.headers, ...options.headers },
        url: new URL(options.url, config.origin),
        fetch,
    })
const createAPI = (baseOptions) => {
    const {
        origin = globalThis.location,
        fetch = standardFetch,
        headers = {},
        ...defOpts
    } = (baseOptions ?? {})
    const config = {
        origin,
        headers,
        defOpts,
    }

    return {
        get: withoutBody(config, "get"),
        options: withoutBody(config, "options"),
        head: withoutBody(config, "head"),
        delete: withoutBody(config, "delete"),
        post: withBody(config, "post"),
        put: withBody(config, "put"),
        patch: withBody(config, "patch"),
    }
}

const base = createAPI()
base.create = createAPI
base.res = res

export default base
