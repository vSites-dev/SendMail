import { Router } from 'express'
import prisma from '../lib/prisma'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const click = await prisma.click.findUnique({
      where: { id: req.params.id }
    })

    if (!click) {
      return res.status(404).send('Click not found')
    }

    if (click.status === 'CLICKED') {
      await prisma.click.create({
        data: {
          emailId: click.emailId,
          link: click.link,
          status: 'CLICKED'
        }
      })
    } else {
      await prisma.click.update({
        where: { id: click.id },
        data: { status: 'CLICKED' }
      })
    }

    res.redirect(click.link)
  } catch (error) {
    console.error('Error tracking click:', error)
    res.status(500).send('Internal server error')
  }
})

export default router
