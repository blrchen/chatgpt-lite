import { useContext, useRef } from 'react'
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogFooter,
  Button,
  Spinner
} from '@material-tailwind/react'
import cs from 'clsx'
import NormalForm from './NormalForm'
import DocumentForm from './DocumentForm'
import ChatContext from '@/contexts/chatContext'

export interface PromptModalProps {}

const PersonaModal = (props: PromptModalProps) => {
  const {
    personaPanelType,
    isOpenPersonaModal: open,
    personaModalLoading: isLoading,
    editPersona: detail,
    onCreatePersona,
    onClosePersonaModal
  } = useContext(ChatContext)

  const normalFormRef = useRef<HTMLFormElement>(null)
  const documentFormRef = useRef<HTMLFormElement>(null)

  const handleOK = () => {
    const form = personaPanelType === 'chat' ? normalFormRef : documentFormRef
    form.current?.submit()
  }

  return (
    <Dialog open={open!} handler={() => {}}>
      <div className="flex items-center justify-between">
        <DialogHeader>{personaPanelType === 'chat' ? 'Prompt' : 'Document'}</DialogHeader>
      </div>
      <div className={cs(isLoading && 'relative ')}>
        <DialogBody divider>
          {personaPanelType === 'chat' ? (
            <NormalForm ref={normalFormRef} detail={detail} onSubmit={onCreatePersona!} />
          ) : (
            <DocumentForm ref={documentFormRef} onSubmit={onCreatePersona!} />
          )}
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="text" onClick={onClosePersonaModal}>
            Cancel
          </Button>
          <Button onClick={handleOK}>OK</Button>
        </DialogFooter>
        {isLoading && (
          <>
            <div className="absolute top-0 left-0 z-10 w-full h-full bg-gray-300 bg-opacity-5 backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 z-10  w-full h-full flex justify-center items-center ">
              <Spinner className="h-6 w-6" />
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}

export default PersonaModal
