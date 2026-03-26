import bcrypt

password = "Pass@123"

# Convert password to bytes
password_bytes = password.encode('utf-8')

# Generate salt and hash
hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

print(hashed.decode())
