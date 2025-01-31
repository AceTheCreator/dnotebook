import CellEditor from "../CellEditor";
import CellOutputRenderer from "../CellOutputRenderer";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import NodejsInterpreter from '../../lib/interpreter/server'
import { outputError, NbCell, AppState } from '../../lib/typings/types'
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import CellOptionsBar from "../MenuBar/cellOptions"
import { updateCells } from "../../lib/state/reducer"
import { cleanErrorMessage } from "../../lib/helpers/utils"

const NoteBookCell = ({ cell }: { cell: NbCell }) => {
    const dispatch = useDispatch();
    const { notebooks, activeNotebookName, interpreterMode } = useSelector((state: { app: AppState }) => state.app)
    const notebook = notebooks[activeNotebookName]
    const { cells } = notebook


    const [cellIsRunning, setCellIsRunning] = useState(false)
    const [output, setOutput] = useState("")
    const [outputError, setOutputError] = useState("")
    const [hasError, setHasError] = useState(false)


    const cellRunCallback = (accumulatedResult: string | outputError, hasErrors: boolean) => {

        if (hasErrors) {
            setHasError(true)
            const fullErrorMessage = cleanErrorMessage(accumulatedResult as outputError)
            setOutputError(fullErrorMessage)

            const newCurrCell = { ...cell, output: "", outputError: fullErrorMessage }
            const newCells = { ...cells, [cell.id]: newCurrCell }
            dispatch(updateCells({ newCells, activeNotebookName }))

        } else {
            setHasError(false)
            setOutput(accumulatedResult as string)

            const newCurrCell = { ...cell, output: accumulatedResult as string, outputError: "" }
            const newCells = { ...cells, [cell.id]: newCurrCell }
            dispatch(updateCells({ newCells, activeNotebookName }))

        }

        setCellIsRunning(false)

    }

    const handleCellRun = () => {
        const content = cell.content
        const language = cell.mode

        if (!content || content.trim() === '') {
            return
        }
        setCellIsRunning(true)
        setOutput("")
        setOutputError("")

        if (interpreterMode === 'node') {
            NodejsInterpreter.exec({ content, language, callback: cellRunCallback, activeNotebookName })
                .catch((error) => {
                    setOutputError({
                        ...error,
                    })
                    console.log(error)
                    setCellIsRunning(false)
                })
        } else {
            //execute in browser context
            console.log('browser')
        }
    }

    const handleKeyPress = (e: any) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleCellRun()
        }
    }

    return (
        <section className="p-2">
            <section className="col-span-12 text-right">
                <CellOptionsBar cell={cell} />
            </section>
            <section>
                <div className="flex"
                    onKeyPress={handleKeyPress}
                >
                    {
                        cellIsRunning ? (
                            <LoadingButton loading ></LoadingButton>

                        ) : (
                            <IconButton
                                aria-label="delete"
                                onClick={() => handleCellRun()}
                                color="primary"
                            >
                                <SendIcon />
                            </IconButton>
                        )
                    }
                    <CellEditor cell={cell} />
                </div>
                <div className="flex ml-8">
                    <CellOutputRenderer cell={cell} />
                </div>

            </section>
        </section>
    )
}

export default NoteBookCell;