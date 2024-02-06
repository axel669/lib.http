const subresolve = (path, part) => {
    if (part === "") {
        return []
    }
    if (part === ".") {
        return path
    }
    if (part === "..") {
        path.pop()
        return path
    }
    path.push(part)
    return path
}
export const resolve = (...parts) => {
    const list = parts.flatMap(
        part => (part.endsWith("/") ? part.slice(0, -1) : part).split("/")
    )
    let path = []
    for (const part of list) {
        path = subresolve(path, part)
    }
    return `/${path.join("/")}`
}
