import { redirect } from 'next/navigation'

export default function Home(): never {
  redirect('/chat')
}
