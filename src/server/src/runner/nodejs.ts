import repl from 'repl';
import vm from 'vm';
import { transformSync } from "@babel/core";

//A simple repl server to evaluate code from the browser
const replServer = repl.start({
    prompt: '',
    eval: replEvalCode,
    ignoreUndefined: true,
    terminal: true,
    useColors: true,
    useGlobal: false
});

replServer.context.__dirname = process.cwd();

async function replEvalCode(code: string) {
    return runNodeCode(code);
}

const runNodeCode = async (code: string, jsFlavor?: string, callback?: (intermediateResult: any) => void) => {
    try {
        // Code may come in any flavor of JS, so we need to convert it to pre-ES5
        const regeneratedCode = transformSync(code, {
            presets: [
                [
                    "@babel/preset-env",
                    {
                        "targets": {
                            "esmodules": true
                        }
                    }
                ]
            ],
        })?.code || code;
        //wrap generated code in async function
        const wrappedCode = `(async () => {${regeneratedCode}})()`;
        
        //Write console logs to call back. This ensures that general console.logs or console.logs in loops
        // are sent to the client.
        replServer.context.console = {
            log: (...args: any[]) => {
                formatAndReturnOutput(args[0], callback);
            }
        };

        const result = await vm.runInNewContext(wrappedCode, replServer.context, {
            displayErrors: true,
        })

        if (result) {
            formatAndReturnOutput(result, callback); //This signifies that the code has finished executing
        }
    } catch (err: any) {
        console.log(err)
        callback && callback({ output: err.message, name: err.name, __$hasError: true });
    }
}

const formatAndReturnOutput = (output: any, callback: any) => {
    //output of some babel transformations will return "use strict" as final result
    // hence we check and return empty string if it is there
    const foutput = output == "use strict" ? "" : output
    callback(foutput);
}

export {
    runNodeCode
}