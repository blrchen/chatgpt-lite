import { AlertDialog, Flex, Button } from '@radix-ui/themes'

interface IProps { 
	children: React.ReactNode;
	onCancel?: (e: MouseEvent) => void;
	onAction?: (e: MouseEvent) => void
}

export const DeleteChatAlert = ({ children, onCancel, onAction }: IProps) => {
	return (
		<AlertDialog.Root>
			<AlertDialog.Trigger>
				{children}
			</AlertDialog.Trigger>
			<AlertDialog.Content style={{ maxWidth: "450px"}}>
				<AlertDialog.Title>Are you sure you want to close the chat?</AlertDialog.Title>
				<AlertDialog.Description size="2">
				Chat history will be deleted
				</AlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<AlertDialog.Cancel onClick={onCancel}>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action onClick={onAction}>
						<Button variant="solid" color="red">
							Close
						</Button>
					</AlertDialog.Action>
				</Flex>
			</AlertDialog.Content>
		</AlertDialog.Root>
	)
}