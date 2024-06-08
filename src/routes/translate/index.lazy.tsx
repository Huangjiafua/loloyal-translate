import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/translate/')({
  component: () => <div>Hello /translate/!</div>
})