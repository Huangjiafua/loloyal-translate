import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/translate/')({
  component: TransltePage
})

function TransltePage() {
  // const enDir = path.join(, "en");
  return <></>
}