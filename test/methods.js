import http from "../node.js"

const echo = http.create("https://echo.axel669.net")
const controller = new AbortController()
const testArgs = {
    url: "delay/2",
    query: {
        a: 1,
        b: 2,
    },
    data: [1, 2, 3, 4],
    signal: controller.signal
}
setTimeout(
    () => controller.abort(),
    500
)
console.log(
    "post", await echo.post(testArgs)
)
console.log(
    "put", await echo.put(testArgs)
)
console.log(
    "patch", await echo.patch(testArgs)
)
console.log(
    "head", await echo.head(testArgs)
)
console.log(
    "delete", await echo.delete(testArgs)
)
