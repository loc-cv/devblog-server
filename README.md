# DevBlog

## A Medium-like web app

### Description

This is the back-end of Medium-like web app, created with **Express**, **Typescript** and **MongoDB**, where users can read or publish their own blog posts. You can find the front-end source code of the app [here](https://github.com/loc-cv/devblog-client).

### Overview

- Using Express.js and fully written in Typescript.
- Full-fledged authentication and authorization implementation with both access token and refresh token.
- Organize configurations with [Node-config](https://www.npmjs.com/package/config).
- Every POST or PATCH routes has validation middlewares with Zod.

### Installation and Setup Instructions

Clone the repository to your local machine:

- Navigate to your cloned directory.
- Create a .env file inside the root directory.
- Provide all values for environment variables in .env file (You can use .env.temp as a placeholder).
- Make sure you have docker and docker-compose installed on your machine.
- run <code>docker-compose up</code>.

### Todo

- [ ] Users can follow each other.
- [ ] Implement notifications.
- [ ] Update user profile photo. This is not a hard task, but I'm too lazy right now ._.
