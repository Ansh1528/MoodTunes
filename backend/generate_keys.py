import secrets
import base64

# Generate a secure random key for JWT
jwt_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
secret_key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')

print("\nGenerated Keys:")
print("==============")
print(f"JWT_SECRET_KEY={jwt_key}")
print(f"SECRET_KEY={secret_key}")
print("\nCopy these values to your .env file") 