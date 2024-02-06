import { resolve } from "./resolve.js"

const contentType = {
    json: "application/json",
    text: "text/plain",
    form: "application/x-www-form-urlencoded",
    upload: "multipart/form-data",
}
const contentStringify = {
    json: data => JSON.stringify(data),
    text: data => data.toString(),
    form: data => new URLSearchParams(data),
    upload: data => new URLSearchParams(data),
}
const prepData = (data, dataType, headers, method) => {
    if (method === "GET" || method === "HEAD") {
        return [undefined, headers]
    }
    return [
        contentStringify[dataType](data),
        {
            ...headers,
            "content-type": contentType[dataType]
        }
    ]
}
const splitArgs = (arg) => {
    if (typeof arg === "string") {
        return [arg, {}]
    }
    const { url, ...options } = arg
    return [url, options]
}
const request = async (base, args, opts, method) => {
    const [path, reqOptions] = splitArgs(args)
    const options = {
        ...opts,
        ...reqOptions,
    }

    const {
        headers,
        data,
        dataType,
        resType,
        errType,
        query,
        ...restOptions
    } = options

    const url = new URL(
        resolve(base.pathname, path),
        base.origin
    )
    url.search = new URLSearchParams(query ?? {})

    const [body, modifiedHeaders] = prepData(data, dataType, headers, method)
    const fetchOptions = {
        method,
        body,
        headers: modifiedHeaders,
        ...restOptions,
    }
    const response = await fetch(url, fetchOptions)

    if (response.ok === false) {
        return {
            ok: false,
            response,
            data: await response[errType]()
        }
    }
    return {
        ok: true,
        response,
        data: (method === "HEAD") ? null : await response[resType]()
    }
}

export const http = (url, options) => {
    return {
        resolve: (...parts) => http(
            new URL(
                resolve(url.pathname, ...parts),
                url.origin
            ),
            options
        ),
        use: (newOptions) => http(
            url,
            { ...options, ...newOptions }
        ),
        get href() {
            return url.href
        },
        get: (args) => request(url, args, options, "GET"),
        post: (args) => request(url, args, options, "POST"),
        head: (args) => request(url, args, options, "HEAD"),
        patch: (args) => request(url, args, options, "PATCH"),
        put: (args) => request(url, args, options, "PUT"),
        delete: (args) => request(url, args, options, "DELETE"),
    }
}
