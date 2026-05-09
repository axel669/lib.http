import http from "@axel669/http"

const echo = http.create({
    origin: "https://echo.axel669.net/",
    parse: http.res.json,
})

const thing = await echo.post({
    url: "/",
    // body: new URLSearchParams({ test: "10" }),
    json: [1, 2, 3, 4]
})

console.log(thing)

const wait = echo.get({
    url: "/delay/5"
})
setTimeout(
    () => wait.abort(),
    1000
)

console.log(
    await wait
)
console.log(
    await echo.head({ url: "/", parse: http.res.text })
)
