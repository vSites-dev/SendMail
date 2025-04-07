import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import { ContactStatus } from '@prisma/client'

const router = Router()

router.post('/subscribe/', async (req: Request, res: Response) => {
  try {
    const { email, name, projectId } = req.body

    if (!email || !projectId || !name) {
      return res
        .status(400)
        .json({ error: 'Email, projectId and name are required' })
    }

    const existingContact = await prisma.contact.findUnique({
      where: {
        projectId_email: {
          projectId,
          email
        }
      }
    })

    if (existingContact) {
      if (existingContact.status === ContactStatus.UNSUBSCRIBED) {
        const updatedContact = await prisma.contact.update({
          where: {
            id: existingContact.id
          },
          data: {
            status: ContactStatus.SUBSCRIBED,
            name: name || existingContact.name
          }
        })

        return res.status(200).json({
          message: 'Successfully resubscribed',
          contact: {
            id: updatedContact.id,
            email: updatedContact.email,
            status: updatedContact.status
          }
        })
      }

      return res.status(200).json({
        message: 'Already subscribed',
        contact: {
          id: existingContact.id,
          email: existingContact.email,
          status: existingContact.status
        }
      })
    }

    const newContact = await prisma.contact.create({
      data: {
        email,
        name: name || null,
        status: ContactStatus.SUBSCRIBED,
        projectId
      }
    })

    return res.status(201).json({
      message: 'Successfully subscribed',
      contact: {
        id: newContact.id,
        email: newContact.email,
        status: newContact.status
      }
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return res.status(500).json({ error: 'Failed to subscribe' })
  }
})

router.get('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Contact ID is required' })
    }

    const contact = await prisma.contact.findUnique({
      where: { id: id as string }
    })

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    const updatedContact = await prisma.contact.update({
      where: { id: id as string },
      data: { status: ContactStatus.UNSUBSCRIBED }
    })

    return res.status(200).json({
      message: 'Successfully unsubscribed',
      contact: {
        id: updatedContact.id,
        email: updatedContact.email,
        status: updatedContact.status
      }
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return res.status(500).json({ error: 'Failed to unsubscribe' })
  }
})

router.post(
  '/generate-unsubscribe-url',
  async (req: Request, res: Response) => {
    try {
      const { contactId } = req.body

      if (!contactId) {
        return res.status(400).json({ error: 'Contact ID is required' })
      }

      const contact = await prisma.contact.findUnique({
        where: { id: contactId }
      })

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' })
      }

      const unsubscribeUrl = `/contacts/unsubscribe?id=${contactId}`

      return res.status(200).json({
        unsubscribeUrl
      })
    } catch (error) {
      console.error('URL generation error:', error)
      return res
        .status(500)
        .json({ error: 'Failed to generate unsubscribe URL' })
    }
  }
)

export default router
