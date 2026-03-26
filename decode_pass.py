import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a plain password matches a bcrypt hash.
    
    Note: Bcrypt is a ONE-WAY hash - it cannot be decoded/reversed.
    You can only verify if a password matches the hash.
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(password_bytes, hashed_bytes)


if __name__ == "__main__":
    print("=" * 50)
    print("Bcrypt Password Verifier")
    print("=" * 50)
    print("\nNote: Bcrypt hashes CANNOT be decoded/reversed.")
    print("This tool verifies if a password matches a hash.\n")
    
    # Get the hashed password from user
    hashed_password = input("Enter the bcrypt hash:").strip()
    
    # Get the password to verify
    password_to_check = input("Enter the password to verify:").strip()
    
    try:
        if verify_password(password_to_check, hashed_password):
            print("\n✓ Password MATCHES the hash!")
        else:
            print("\n✗ Password does NOT match the hash.")
    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure you entered a valid bcrypt hash.")
