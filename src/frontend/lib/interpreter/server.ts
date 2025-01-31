import { outputError } from '../typings/types'
import { marked } from "marked"
import { formatErrorMessage } from "../helpers/utils"

const SERVER_URL = process.env.NEXT_PUBLIC_CODE_SERVER_URL

type ExecProps = {
    content: string,
    language: string,
    activeNotebookName: string,
    callback: (accumulatedResult: string | outputError, hasErrors: boolean) => void
}
class ServerAPI {
    /**
     * Executes the code in the given language via the server. Intermediary results like those in
     * loops and other functions are sent to the callback.
     * @param content The code/content to execute/compile.
     * @param language The language the content is written in.
     * @param callback A callback that is called with the result/intermediate result of the execution.
     * @returns A promise that resolves when the execution is finished.
     * @throws Error if the language is not supported.
     */
    async exec({ content, language, callback, activeNotebookName }: ExecProps) {
        if (["typescript", "javascript", "bash", "sh", "powershell", "process"].includes(language)) {
            return this.executeInNodeJs({ content, language, callback, activeNotebookName });

        } else if (language === "markdown") {
            try {
                let md = marked.parse(content);
                callback(md, false);
            } catch (e: any) {
                const errMsg = formatErrorMessage(e)
                return callback(errMsg, true)
            }

        } else if (language === "json") {

            try {
                let json = JSON.parse(content);
                json = JSON.stringify(json, null, 2);
                json = `<pre><code>${json} </code></pre>`
                return callback(json, false)
            } catch (e: any) {
                const errMsg = formatErrorMessage(e)
                return callback(errMsg, true)
            }

        } else if (language === "html") {

            try {
                let html = `<embed src="data:text/html;charset=utf-8;base64,${btoa(content)}" />`
                return callback(html, false)
            } catch (e: any) {
                const errMsg = formatErrorMessage(e)
                return callback(errMsg, true)
            }

        } else {

            return callback(`Language ${language} not supported!`, true)
        }
    }

    /**
     * Runs the code in nodejs server.
     * @param content The code/content to execute/compile.
     * @param jsFlavor The flavor of javascript used. ES6, JavaScript, TypeScript, etc.
     * @param callback A callback that is called with the result/intermediate result of the execution.
     * @returns A promise that resolves when the execution is finished.
     * */
    async executeInNodeJs({ content, language, callback, activeNotebookName }: ExecProps) {

        fetch(`${SERVER_URL}/nodejs/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                language,
                activeNotebookName
            }),
        })
            .then(response => response.body)
            .then(body => body?.getReader())
            .then(reader => {
                let textAccumulator = "";
                const read = () => reader?.read().then(({ done, value }) => {
                    if (done) {
                        return;
                    }
                    const text = new TextDecoder("utf-8").decode(value);
                    try {
                        const textInJson = JSON.parse(text)
                        if (typeof textInJson === 'object' && textInJson !== null) {
                            if (Object.keys(textInJson).includes("__$hasError")) {
                                callback(textInJson, true) //format error before return
                            } else {
                                textAccumulator += text
                                callback(textAccumulator, false)
                            }
                        } else {
                            textAccumulator += text
                            callback(textAccumulator, false)
                        }
                    } catch (error) {
                        textAccumulator += text
                        callback(textAccumulator, false)
                    }

                    read();
                });
                read();
            });
    }
}

export default new ServerAPI();