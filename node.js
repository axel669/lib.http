import { http } from "./http.js"

const defaultOptions = {
    resType: "json",
    errType: "json",
    dataType: "json",
}

export default {
    create: (url, options) => http(
        new URL(url),
        { ...defaultOptions, ...options }
    )
}
