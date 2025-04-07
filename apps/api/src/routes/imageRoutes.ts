import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] }
    }
    namespace Multer {
      interface File {
        fieldname: string
        originalname: string
        encoding: string
        mimetype: string
        size: number
        destination: string
        filename: string
        path: string
        buffer: Buffer
      }
    }
  }
}

const router = express.Router()

const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir)
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniquePrefix + ext)
  }
})

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'))
  }
}
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})
router.post(
  '/upload',
  upload.single('image'),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' })
      }

      const baseUrl =
        process.env.API_URL || `http://localhost:${process.env.PORT || 8080}`
      const imageUrl = `${baseUrl}/images/${req.file.filename}`

      return res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: imageUrl
        }
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      return res.status(500).json({ error: 'Failed to upload image' })
    }
  }
)

interface MulterError extends Error {
  code: string
  field?: string
}

router.use(
  (
    err: Error | MulterError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof Error && 'code' in err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .json({ error: 'File is too large. Maximum size is 5MB.' })
      }
      return res.status(400).json({ error: err.message })
    } else if (err) {
      return res.status(400).json({ error: err.message })
    }
    next()
  }
)

export default router
