import express from "express"; 
import { PrismaClient } from "@prisma/client"; 

const app = express(); 
const prisma = new PrismaClient(); 

app.use(express.json()); 

const PORT = process.env.PORT; 
  
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});