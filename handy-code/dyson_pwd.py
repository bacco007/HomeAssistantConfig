"""
Transfers the password from the sticker to the needed hash.
"""
import base64
import hashlib

# Ask for the password
pwd = input("Product WiFi Password (e.g.: adgjsfhk):")

# Transfer password to hash version
hash = hashlib.sha512()
hash.update(pwd.encode("utf-8"))
pwd_hash = base64.b64encode(hash.digest()).decode("utf-8")

# Print out password hash
print(pwd_hash)
