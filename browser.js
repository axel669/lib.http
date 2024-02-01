import { http } from "./http.js"

const base = new URL(location)
const defaultOptions = {
    resType: "json",
    errType: "json",
    dataType: "json",
}

const self = http(base, { credentials: "include", ...defaultOptions })
self.create = (url, options) => http(
    new URL(url),
    { ...defaultOptions, ...options }
)
export default self
