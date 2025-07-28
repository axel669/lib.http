// @ts-check
import http from "@axel669/http"

const echo = http.origin("https://echo.axel669.net")

const thing = await echo.post`/`({
    // body: new URLSearchParams({ test: "10" }),
    json: [1, 2, 3, 4],
    headers: {
        "content-type": "application/json"
    }
}).promise

console.log(thing)
console.log(await thing.res.json())

const get = await echo.get`/some/path/example-text`().promise
console.log(await get.res.json())

const standalone = http.req.get`https://echo.axel669.net/delay/2`()
setTimeout(() => standalone.abort(), 500)
console.log(await standalone.promise)
