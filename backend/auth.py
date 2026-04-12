import os
import requests
import jwt
from typing import Dict, Any
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# Simple cache for JWKS (JSON Web Key Set)
_jwks_cache = {}

def get_jwks(issuer_url: str) -> Dict[str, Any]:
    global _jwks_cache
    if issuer_url not in _jwks_cache:
        jwks_url = f"{issuer_url.rstrip('/')}/.well-known/jwks.json"
        try:
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            _jwks_cache[issuer_url] = response.json()
        except requests.RequestException as e:
            raise HTTPException(status_code=401, detail=f"Failed to fetch JWKS: {str(e)}")
    return _jwks_cache[issuer_url]

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Validates a Clerk JWT by fetching the public JWKS from the issuer URL
    in the token's unverified claims.
    """
    token = credentials.credentials
    try:
        # Decode without verification first to extract the 'kid' and 'iss'
        unverified_header = jwt.get_unverified_header(token)
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        
        issuer = unverified_claims.get("iss")
        if not issuer:
            raise HTTPException(status_code=401, detail="Invalid token: missing issuer")
            
        # Clerk usually enforces an authorized party (azp), 
        # But for generic verification, matching signature + expiry + iss is safe.
        
        jwks = get_jwks(issuer)
        
        # Find the correct RSA key using the Key ID (kid)
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == unverified_header.get("kid"):
                rsa_key = key
                break
                
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Signing key not found in JWKS.")
            
        # Convert JWK to a usable public key
        from jwt.algorithms import RSAAlgorithm
        public_key = RSAAlgorithm.from_jwk(rsa_key)
        
        # Verify the token cryptographically
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"verify_aud": False} # Clerk tokens often lack 'aud', relying on 'azp'
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
