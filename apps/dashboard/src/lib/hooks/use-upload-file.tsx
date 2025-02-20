import * as React from "react"
import { toast } from "sonner"

export function useUploadFile(
  endpoint: any,
  {
    defaultUploadedFiles = [],
    ...props
  }: any = {}
) {
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>(defaultUploadedFiles)
  const [progresses, setProgresses] = React.useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = React.useState(false)

  async function onUpload(files: File[]) {
    setIsUploading(true)
    try {
      // const res = await uploadFiles(endpoint, {
      //   ...props,
      //   files,
      //   onUploadProgress: ({ file, progress }) => {
      //     setProgresses((prev) => {
      //       return {
      //         ...prev,
      //         [file.name]: progress,
      //       }
      //     })
      //   },
      // })
      const res = []

      setUploadedFiles((prev) => (prev ? [...prev, ...res] : res))
    } catch (err) {
      console.error(err)
      toast.error("Valami hiba történt a fájl(ok) feltöltése során!")
    } finally {
      setProgresses({})
      setIsUploading(false)
    }
  }

  return {
    onUpload,
    uploadedFiles,
    progresses,
    isUploading,
  }
}
