type Expand<T> = {
    [K in keyof T]: T[K]
} & {}

export type Complete = {
    state: "complete"
    res: Response
}
export type Incomplete = {
    state: "incomplete"
    res: Response
}
export type Cancel = {
    state: "cancel"
}
export type Fail = {
    state: "fail"
    error: Error
}

export type Result = Expand<Complete | Incomplete | Fail | Cancel>

export type Options = Expand<{
    url: string
    options?: RequestInit
}>

export type CancellableRequest = {
    promise: Promise<Result>
    abort: () => void
}

export type KV<Value> = { [key: string]: Value }

export type Method =
    "get" | "post" | "put" | "options" | "head" | "delete" | "patch"

export type RequestOptions = Expand<
    Omit<RequestInit, "method" | "headers">
    & {
        json?: any
        headers?: KV<string>
        type?: string
        query?: KV<string> | URLSearchParams
    }
>

export type OptionsBuilder =
    (url: string, method: Method, options?: RequestOptions) => Options
export type RequestBuilder =
    (raw: TemplateStringsArray, ...values: any[]) =>
        (options?: RequestOptions) => CancellableRequest
