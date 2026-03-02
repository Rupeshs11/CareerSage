import bcrypt

password = "Rupesh@256"

# Convert password to bytes
password_bytes = password.encode('utf-8')

# Generate salt and hash
hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

print(hashed.decode())
