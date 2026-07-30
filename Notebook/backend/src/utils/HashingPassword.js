import bcrypt from 'bcrypt'

async function registerUser(plainPassword) {
  const saltRounds = 10; 
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  
  return hashedPassword;
}


export default registerUser