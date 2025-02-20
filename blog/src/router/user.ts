import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signinInput, signupInput } from "@guntreddyhemanth/medium-application";


export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post("/signup", async(c) => {
  const body = await c.req.json()
  const {success} = signinInput.safeParse(body);
  if(!success){
    c.status(411)
    return c.json({
      message: "Input not correct"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const user = await prisma.user.create({
      data:{
        name: body.name,
        password: body.password,
        email: body.email
      }
    })

    const jwt = await sign({
      id: user.id,
    }, c.env.JWT_SECRET)

    return c.text(jwt)
  } catch (e) {
    console.log(e)
    c.status(411)
    return c.text("Invalid Message")
  }
})

userRouter.post("/signin", async (c) => {
  const body = await c.req.json()
  const {success} = signupInput.safeParse(body)
  if (!success){
    c.status(411)
    return c.json({
      message: "Input are not correct"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try {
    const user = await prisma.user.findFirst({
      where:{
        email: body.email,
        password: body.password
      }
    })

    if (!user){
      c.status(403)
      return c.json({
        message: "Invalid credinals"
      })
    }

    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET)
    return c.text(jwt)
  } catch (e) {
    console.log(e);
    return c.text("Invalid")
  }
})


