import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from "hono/jwt";
import { createPostInput, updatePostInput } from "@guntreddyhemanth/medium-application";


export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables:{
        userId: string;
    }
}>()

blogRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET) as { id: string };
        
        if (user && user.id) {
            c.set("userId", user.id); // Now TypeScript recognizes `user.id` as a string
            await next();
        } else {
            c.status(403)
            return c.json({
                message: "You are not logged in"
            });
        }
    } catch (error) {
        c.status(403);
        return c.json({
            message: "Invalid token"
        });
    }
});


blogRouter.post("/", async (c) => {
    const body = await c.req.json()
    const {success} = createPostInput.safeParse(body)
    if (!success){
        c.status(411)
        return c.json({
            message: "Input not correct"
        })
    }
    const authorId= c.get("userId")
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
       const blog =  await prisma.blog.create({
            data:{
                title: body.title,
                content: body.content,
                authorId: authorId
            }
        })

        return c.json({
            id: blog
        })
    } catch (e) {
        return c.json({
            message: "invalid user"
        })
    }
})

blogRouter.put("/", async (c) => {
    const body = await c.req.json()
    const {success} = updatePostInput.safeParse(body)
    if (!success){
        c.status(411)
        return c.json({
            message: "Input not correct"
        })
    }
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
       const blog =  await prisma.blog.update({
            where:{
                id: body.id
            }, 
            data: {
                title: body.title,
                content: body.content
            }
        })
        return c.json({
            id: blog
        })
    } catch (e) {
        return c.json({
            message: "invalid user"
        })
    }
})

blogRouter.get("/bulk", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findMany()
        return c.json({
            blog
        })
    } catch (e) {
        c.status(411)
        c.json({
            message: "They is no Blog for this account"
        })
    }
})


blogRouter.get("/:id", async (c) => {
    const id = c.req.param("id")
    const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
       const blog =  await prisma.blog.findFirst({
            where:{
                id: id
            },
        })
        return c.json({
            id: blog
        })
    } catch (e) {
        c.status(411)
        return c.json({
            message: "invalid user"
        });
    }
})

