import Image from 'next/image'

export const BotIcon = () => (
	<Image
		src="/bot-icon.png"
		alt="TurboChat"
		width={32}
		height={32}
		className="rounded-full"
	/>
)