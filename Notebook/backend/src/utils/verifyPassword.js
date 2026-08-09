import bcrypt from 'bcrypt'

async function verifyPassword(enteredPassword, storedHash) {
  const isMatch = await bcrypt.compare(enteredPassword, storedHash);
  
  if (isMatch) {
    console.log("Login successful!");
  } else {
    console.log("Invalid password.");
  }
  return isMatch
}

export default verifyPassword