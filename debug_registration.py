#!/usr/bin/env python3
"""
Debug script para diagnosticar problemas de registro
"""

import requests
import json
from datetime import datetime

def debug_registration():
    """Debug registration issues"""
    
    print("🔍 Diagnosticando problemas de registro")
    print("=" * 50)
    
    # Test backend health
    print("1. Verificando estado del backend...")
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend funcionando correctamente")
        else:
            print(f"   ❌ Backend error: {response.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("   ❌ No se puede conectar al backend en puerto 8001")
        print("   💡 Asegúrate de que el backend esté corriendo:")
        print("      uvicorn app.main:app --reload --port 8001")
        return
    
    # Test CORS
    print("2. Verificando CORS...")
    try:
        response = requests.options(
            "http://localhost:8001/auth/register",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=5
        )
        if response.status_code in [200, 204]:
            print("   ✅ CORS configurado correctamente")
        else:
            print(f"   ❌ CORS error: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Error de CORS: {e}")
        return
    
    # Test registration with unique email
    print("3. Probando registro con email único...")
    unique_email = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
    
    try:
        response = requests.post(
            "http://localhost:8001/auth/register",
            json={
                "email": unique_email,
                "password": "testpassword123"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Email de prueba: {unique_email}")
        print(f"   Status code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 201:
            print("   ✅ Registro exitoso!")
            
            # Test login
            print("4. Probando login...")
            login_response = requests.post(
                "http://localhost:8001/auth/login",
                json={
                    "email": unique_email,
                    "password": "testpassword123"
                },
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if login_response.status_code == 200:
                print("   ✅ Login exitoso!")
                token_data = login_response.json()
                print(f"   Token recibido: {token_data['access_token'][:20]}...")
            else:
                print(f"   ❌ Login falló: {login_response.text}")
        else:
            print(f"   ❌ Registro falló: {response.text}")
            
            # Parse error details
            try:
                error_data = response.json()
                print(f"   Error específico: {error_data.get('message', 'Unknown error')}")
                if 'details' in error_data:
                    print(f"   Detalles: {error_data['details']}")
            except:
                pass
                
    except requests.exceptions.Timeout:
        print("   ❌ Timeout - el servidor tardó demasiado en responder")
    except requests.exceptions.ConnectionError:
        print("   ❌ Error de conexión")
    except Exception as e:
        print(f"   ❌ Error inesperado: {e}")
    
    print("\n💡 Soluciones comunes:")
    print("   1. Si el email ya existe, usa uno diferente")
    print("   2. Asegúrate de que la contraseña tenga al menos 8 caracteres")
    print("   3. La contraseña debe tener letras y números")
    print("   4. Verifica que ambos servidores estén corriendo:")
    print("      - Backend: http://localhost:8001")
    print("      - Frontend: http://localhost:5173")
    print("   5. Revisa la consola del navegador para errores específicos")

if __name__ == "__main__":
    debug_registration()