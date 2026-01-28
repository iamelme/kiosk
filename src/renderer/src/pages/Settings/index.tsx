import Alert from '@renderer/components/ui/Alert'
import Button from '@renderer/components/ui/Button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'

export default function General(): ReactNode {
  const {
    data: settings,
    isPending,
    error
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await window.apiSettings.getSettings()

      if (res.error && res.error instanceof Error) {
        throw new Error(res.error.message)
      }

      return res.data
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await window.apiElectron.uploadLogo()
      if (res) {
        const resLogo = await window.apiSettings.uploadLogo(res)

        if (resLogo.error && resLogo.error instanceof Error) {
          throw new Error(resLogo.error.message)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <Alert variant="danger">{error.message}</Alert>
  }

  return (
    <>
      {settings.logo ? (
        <div className="max-w-[200px] cursor-pointer" onClick={() => mutation.mutate()}>
          <img src={`elme-cute://${settings.logo}?v=${Date.now()}`} alt="logo" />
        </div>
      ) : (
        <Button type="button" onClick={() => mutation.mutate()}>
          Upload
        </Button>
      )}
    </>
  )
}
