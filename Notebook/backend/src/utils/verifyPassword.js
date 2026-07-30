import bcrypt from 'bcrypt'

async function loginUser(enteredPassword, storedHash) {
  const isMatch = await bcrypt.compare(enteredPassword, storedHash);
  
  if (isMatch) {
    console.log("Login successful!");
  } else {
    console.log("Invalid password.");
  }
}

export default loginUser